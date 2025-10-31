"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  consignmentDraftSchema,
  type ConsignmentDraftType,
} from "@/components/schemas/source.schema";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, X } from "lucide-react";
import AddItemRow from "../commands/items.command";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserComboBox } from "../comboBoxs/user.comboBox";
import type { ProductType } from "../schemas/product.schema";
import { PartnerComboBox } from "../comboBoxs/partner.comboBox";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

type ConsignmentProps = {
  onSubmit: (formData: ConsignmentDraftType) => void;
};

export default function CreateConsignmentForm({ onSubmit }: ConsignmentProps) {
  const [isOpen, setIsOpen] = useState(true);
  const form = useForm<ConsignmentDraftType>({
    resolver: zodResolver(consignmentDraftSchema),
    defaultValues: {
      note: "",
      subtotal: 0,
      type: "In",
      commissionRate: 0,
      discountAmount: 0,
      quantity: 0,
      items: [],
    },
  });

  const { control, setValue, reset } = form;

  const watchedQuantity = useWatch({
    control: form.control,
    name: "quantity",
  });

  const watchedType = useWatch({
    control: form.control,
    name: "type",
  });

  const watchedCommissionRate = useWatch({
    control: form.control,
    name: "commissionRate",
  });

  const watchedSubtotal = useWatch({
    control: form.control,
    name: "subtotal",
  });

  const watchedDiscountAmount = useWatch({
    control: form.control,
    name: "discountAmount",
  });

  const watchedPartner = useWatch({
    control: form.control,
    name: "partner",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const handleQuantityChange = (index: number, quantity: number) => {
    const item = form.getValues(`items.${index}`);
    const { unitPrice } = item;

    const subtotal = unitPrice * quantity;

    const allItems = form.getValues("items");
    const totalQuantity = allItems.reduce((acc, item, i) => {
      return acc + (i === index ? quantity : item.quantity);
    }, 0);

    form.setValue(`quantity`, totalQuantity);
    form.setValue(`items.${index}.subtotal`, subtotal);
  };

  const handleAddProduct = (product: ProductType) => {
    if (watchedType === "Out" && product.quantity <= 0) {
      toast.error("Product not available!");
      return;
    }

    const selectedProducts = form.getValues("items");

    const alreadyExists = selectedProducts.some(
      (selectedProduct) =>
        selectedProduct.itemableType === "Product" &&
        selectedProduct.itemableId === product.id
    );

    if (alreadyExists) {
      toast.error("Product already added!");
      return;
    }

    const priceTmp =
      watchedType === "In"
        ? product.defaultPurchasePrice
        : product.defaultOrderPrice;

    append({
      quantity: 1,
      itemableId: product.id,
      itemableType: "Product",
      name: product.name,
      description: product.description,
      availableQuantity: product.quantity,
      unitPrice: priceTmp!,
      defaultOrderPrice: product.defaultOrderPrice!,
      defaultPurchasePrice: product.defaultPurchasePrice!,
      subtotal: priceTmp!,
    });

    setValue("quantity", watchedQuantity + 1);
    setValue("subtotal", watchedSubtotal + priceTmp!);

    toast.success(`Add product "${product.name}" success!`);
  };

  const handleRemoveItem = (index: number) => {
    const item = form.getValues(`items.${index}`);

    setValue("quantity", watchedQuantity - item.quantity);
    setValue("subtotal", watchedSubtotal - item.subtotal);

    remove(index);
    toast.success(`Remove item success!`);
  };

  const calculateConsignment = () => {
    const items = form.getValues("items");
    let consignmentQuantity = 0;
    let consignmentSubtotal = 0;

    items.forEach((item) => {
      consignmentQuantity += item.quantity;
      consignmentSubtotal += item.subtotal;
    });

    const discountAmount = watchedCommissionRate
      ? (consignmentSubtotal * watchedCommissionRate) / 100
      : 0;

    return {
      quantity: consignmentQuantity,
      subtotal: consignmentSubtotal,
      discountAmount,
    };
  };

  useEffect(() => {
    const result = calculateConsignment();

    const currentSubtotal = form.getValues("subtotal");
    const currentQuantity = form.getValues("quantity");
    const currentDiscountAmount = form.getValues("discountAmount");

    if (
      currentDiscountAmount !== result.discountAmount ||
      currentSubtotal !== result.subtotal ||
      currentQuantity !== result.quantity
    ) {
      setValue("subtotal", result.subtotal >= 0 ? result.subtotal : 0);
      setValue(
        "discountAmount",
        result.discountAmount >= 0 ? result.discountAmount : 0
      );
      setValue("quantity", result.quantity >= 0 ? result.quantity : 0);
    }
  }, [watchedCommissionRate, watchedQuantity, watchedSubtotal]);

  const onInternalSubmit = async (data: ConsignmentDraftType) => {
    if (!watchedPartner) {
      toast.error("Partner is required!");
      return;
    }

    await onSubmit(data);
    reset();
  };

  const handleChangeUnitPrice = (index: number, unitPrice: number) => {
    const item = form.getValues(`items.${index}`);

    const itemSubtotal = unitPrice * item.quantity;

    const allItems = form.getValues("items");
    const consignmentSubtotal = allItems.reduce((acc, item, i) => {
      return acc + (i === index ? unitPrice : item.unitPrice);
    }, 0);

    form.setValue(`subtotal`, consignmentSubtotal);
    form.setValue(`items.${index}.subtotal`, itemSubtotal);
  };

  useEffect(() => {
    if (watchedPartner) {
      if (watchedType === "In" && watchedPartner.type === "Customer")
        form.setValue("partner", undefined);

      if (watchedType === "Out" && watchedPartner.type === "Supplier")
        form.setValue("partner", undefined);
    }

    const items = form.getValues("items");

    items.forEach((item, idx) => {
      if (item.itemableType === "Product") {
        const newUnitPrice =
          watchedType === "In"
            ? item.defaultPurchasePrice
            : item.defaultOrderPrice;

        form.setValue(`items.${idx}.unitPrice`, newUnitPrice);
        form.setValue(`items.${idx}.subtotal`, newUnitPrice * item.quantity);
      }
    });

    const { quantity, subtotal, discountAmount } = calculateConsignment();
    form.setValue("quantity", quantity);
    form.setValue("subtotal", subtotal);
    form.setValue("discountAmount", discountAmount);
  }, [watchedType]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onInternalSubmit)}
        className="text-xl h-full w-full"
      >
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-6 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Create Consignment
              </h1>
              <p className="text-gray-600">
                Manage your consignment inventory and partnerships
              </p>
            </div>

            <div className="flex lg:flex-row flex-col gap-6">
              {/* Main Content Area */}
              <div className="flex-1 space-y-6">
                {/* Consignment Information Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Consignment Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                    {/* Partner */}
                    <FormField
                      control={form.control}
                      name="partner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            {watchedType === "In" ? "Supplier" : "Customer"}
                          </FormLabel>
                          <FormControl>
                            <PartnerComboBox
                              value={field.value}
                              onChange={(partner) => field.onChange(partner)}
                              type={
                                watchedType === "In" ? "Supplier" : "Customer"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payer - Conditional */}
                    {watchedType === "In" && (
                      <FormField
                        control={form.control}
                        name="payer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Payer
                            </FormLabel>
                            <FormControl>
                              <UserComboBox
                                value={field.value}
                                onChange={(payer) => field.onChange(payer)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Note */}
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Note
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Add a note..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Commission Rate */}
                    <FormField
                      control={form.control}
                      name="commissionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Commission Rate (%)
                          </FormLabel>
                          <FormControl>
                            <Input
                              min={0}
                              max={100}
                              step={"any"}
                              type="number"
                              placeholder="0.00"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Type */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup className="w-full">
                                <SelectItem value="In">
                                  <span className="flex items-center gap-2">
                                    <svg
                                      className="w-4 h-4 text-green-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16l-4-4m0 0l4-4m-4 4h18"
                                      />
                                    </svg>
                                    In
                                  </span>
                                </SelectItem>
                                <SelectItem value="Out">
                                  <span className="flex items-center gap-2">
                                    <svg
                                      className="w-4 h-4 text-blue-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                      />
                                    </svg>
                                    Out
                                  </span>
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="flex md:flex-row flex-col md:min-h-[550px]">
                    {/* Add Items Sidebar */}
                    <div className="md:w-64 bg-gradient-to-br from-purple-50 to-pink-50 p-5 border-r border-purple-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add Products
                      </h3>
                      <AddItemRow
                        handleAddProduct={handleAddProduct}
                        handleAddService={undefined}
                        handleAddCourse={undefined}
                        source={"Consignment"}
                      />
                    </div>

                    {/* Items Table - Desktop */}
                    <Collapsible
                      open={isOpen}
                      onOpenChange={setIsOpen}
                      className="hidden md:flex flex-col flex-1"
                    >
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6 flex items-center justify-between border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                          Consignment Items
                          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {watchedItems.length}
                          </span>
                        </h4>

                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-200 rounded-lg"
                          >
                            <ChevronsUpDown className="w-5 h-5" />
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent className="flex-1 overflow-y-auto">
                        {watchedItems.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <svg
                              className="w-16 h-16 mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            <p className="text-lg font-medium">
                              No items added yet
                            </p>
                            <p className="text-sm">
                              Add products to start tracking consignment
                            </p>
                          </div>
                        ) : (
                          <Table>
                            <TableCaption className="text-gray-500">
                              A list of your selected items
                            </TableCaption>
                            <TableHeader className="sticky top-0 z-10 bg-gray-50">
                              <TableRow>
                                <TableHead className="font-semibold text-gray-700">
                                  Product Name
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                  Qty
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                  Unit Price
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                  Subtotal
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                  Total
                                </TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {fields.map((field, index) => {
                                return (
                                  <TableRow
                                    key={field.id}
                                    className="hover:bg-purple-50/30 transition-colors"
                                  >
                                    <TableCell className="font-medium text-gray-900">
                                      {watchedItems?.[index]?.name}
                                    </TableCell>

                                    {/* Quantity */}
                                    <TableCell className="w-24">
                                      <FormField
                                        name={`items.${index}.quantity`}
                                        control={control}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                min={1}
                                                value={field.value}
                                                onChange={(e) => {
                                                  const val = e.target.value;
                                                  const number = !val
                                                    ? null
                                                    : Number(val);
                                                  field.onChange(number);
                                                  handleQuantityChange(
                                                    index,
                                                    number ?? 1
                                                  );
                                                }}
                                                onBlur={(e) => {
                                                  let number = Number(
                                                    e.target.value
                                                  );
                                                  if (!number) number = 1;
                                                  field.onChange(number);
                                                  handleQuantityChange(
                                                    index,
                                                    number
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormMessage />
                                    </TableCell>

                                    {/* Unit Price */}
                                    <TableCell className="w-32">
                                      <FormField
                                        name={`items.${index}.unitPrice`}
                                        control={control}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                min={0}
                                                value={field.value}
                                                onChange={(e) => {
                                                  const val = e.target.value;
                                                  const number = !val
                                                    ? null
                                                    : Number(val);
                                                  field.onChange(number);
                                                  handleChangeUnitPrice(
                                                    index,
                                                    number ?? 0
                                                  );
                                                }}
                                                onBlur={(e) => {
                                                  const number = Number(
                                                    e.target.value
                                                  );
                                                  field.onChange(number ?? 0);
                                                }}
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </TableCell>

                                    {/* Subtotal */}
                                    <TableCell className="font-medium text-gray-900">
                                      {formatCurrency(
                                        watchedItems?.[index]?.subtotal || 0
                                      )}
                                    </TableCell>

                                    {/* Total */}
                                    <TableCell className="font-semibold text-purple-600">
                                      {formatCurrency(
                                        watchedItems?.[index]?.subtotal -
                                          (watchedItems?.[index]
                                            ?.discountAmount ?? 0) >
                                          0
                                          ? watchedItems?.[index]?.subtotal -
                                              (watchedItems?.[index]
                                                ?.discountAmount ?? 0)
                                          : 0
                                      )}
                                    </TableCell>

                                    <TableCell className="w-12">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => handleRemoveItem(index)}
                                        className="hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                      >
                                        <X size={18} />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Items List - Mobile */}
                    <Collapsible
                      open={isOpen}
                      onOpenChange={setIsOpen}
                      className="md:hidden flex flex-col flex-1"
                    >
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-5 flex items-center justify-between border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          Consignment Items
                          <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {watchedItems.length}
                          </span>
                        </h4>

                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-200 rounded-lg"
                          >
                            <ChevronsUpDown className="w-5 h-5" />
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {watchedItems.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <svg
                              className="w-16 h-16 mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            <p className="text-base font-medium">
                              No items added
                            </p>
                          </div>
                        ) : (
                          fields.map((field, index) => {
                            return (
                              <Card
                                key={field.id}
                                className="shadow-md hover:shadow-lg transition-shadow border-gray-200"
                              >
                                <CardHeader className="flex flex-row justify-between items-start pb-3 bg-gradient-to-r from-purple-50 to-pink-50">
                                  <CardTitle className="text-base font-semibold text-gray-900">
                                    {watchedItems?.[index]?.name}
                                  </CardTitle>
                                  <CardAction>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => handleRemoveItem(index)}
                                      className="hover:bg-red-50 hover:text-red-600 rounded-lg p-2"
                                    >
                                      <X size={18} />
                                    </Button>
                                  </CardAction>
                                </CardHeader>

                                <CardContent className="space-y-4 text-sm">
                                  {/* Quantity */}
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">
                                      Quantity
                                    </span>
                                    <FormField
                                      name={`items.${index}.quantity`}
                                      control={control}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              min={1}
                                              value={field.value}
                                              className="w-20"
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                const number = !val
                                                  ? null
                                                  : Number(val);
                                                field.onChange(number);
                                                handleQuantityChange(
                                                  index,
                                                  number ?? 1
                                                );
                                              }}
                                              onBlur={(e) => {
                                                let number = Number(
                                                  e.target.value
                                                );
                                                if (!number) number = 1;
                                                field.onChange(number);
                                                handleQuantityChange(
                                                  index,
                                                  number
                                                );
                                              }}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  {/* Unit Price */}
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">
                                      Unit Price
                                    </span>
                                    <FormField
                                      name={`items.${index}.unitPrice`}
                                      control={control}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              min={0}
                                              value={field.value}
                                              className="w-28"
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                const number = !val
                                                  ? null
                                                  : Number(val);
                                                field.onChange(number);
                                                handleChangeUnitPrice(
                                                  index,
                                                  number ?? 0
                                                );
                                              }}
                                              onBlur={(e) => {
                                                const number = Number(
                                                  e.target.value
                                                );
                                                field.onChange(number ?? 0);
                                              }}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  {/* Subtotal */}
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">
                                      Subtotal
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                      {formatCurrency(
                                        watchedItems?.[index]?.subtotal ?? 0
                                      )}
                                    </span>
                                  </div>

                                  {/* Discount amount */}
                                  <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                                    <span className="text-gray-600 font-medium">
                                      Discount Amount
                                    </span>
                                    <span className="text-red-600 font-semibold">
                                      {watchedItems?.[index]?.discountAmount
                                        ? `- ${formatCurrency(
                                            watchedItems?.[index]
                                              ?.discountAmount ?? 0
                                          )}`
                                        : "-"}
                                    </span>
                                  </div>
                                </CardContent>

                                <CardFooter className="flex justify-between font-bold bg-gradient-to-r from-purple-50 to-pink-50 text-base">
                                  <span className="text-gray-700">Total</span>
                                  <span className="text-purple-600">
                                    {formatCurrency(
                                      watchedItems?.[index]?.subtotal -
                                        (watchedItems?.[index]
                                          ?.discountAmount ?? 0) >
                                        0
                                        ? watchedItems?.[index]?.subtotal -
                                            (watchedItems?.[index]
                                              ?.discountAmount ?? 0)
                                        : 0
                                    )}
                                  </span>
                                </CardFooter>
                              </Card>
                            );
                          })
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>

              {/* Consignment Summary Sidebar */}
              <div className="lg:w-96 w-full">
                <div className="sticky top-6">
                  <Card className="shadow-xl border-gray-200 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        Consignment Summary
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 p-6">
                      {/* Type */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                          Type
                        </span>
                        <span
                          className={`font-semibold text-lg px-3 py-1 rounded-full ${
                            watchedType === "In"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {watchedType}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Total Items</span>
                        <span className="font-semibold text-gray-900 text-lg">
                          {watchedQuantity}
                        </span>
                      </div>

                      {/* Subtotal */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold text-gray-900 text-lg">
                          {formatCurrency(watchedSubtotal)}
                        </span>
                      </div>

                      {/* Commission Rate */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Commission Rate</span>
                        <span className="font-semibold text-purple-600 text-lg">
                          {watchedCommissionRate}%
                        </span>
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center py-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl px-4 mt-2">
                        <span className="font-bold text-gray-900 text-lg">
                          Total Amount
                        </span>
                        <span className="font-bold text-purple-600 text-2xl">
                          {formatCurrency(
                            watchedDiscountAmount
                              ? watchedSubtotal - watchedDiscountAmount > 0
                                ? watchedSubtotal - watchedDiscountAmount
                                : 0
                              : watchedSubtotal
                          )}
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Create Consignment
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
