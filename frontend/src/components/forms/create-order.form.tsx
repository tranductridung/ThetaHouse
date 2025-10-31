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
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  orderDraftSchema,
  type OrderDraftType,
} from "@/components/schemas/source.schema";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type ProductType } from "../schemas/product.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ServiceType } from "../schemas/service.schema";
import type { DiscountType } from "../schemas/discount.schema";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { ChevronsUpDown, X } from "lucide-react";
import { PartnerComboBox } from "../comboBoxs/partner.comboBox";
import AddItemRow from "../commands/items.command";
import type { CourseType } from "../schemas/course.schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { DiscountComboBox } from "../comboBoxs/discount.comboBox";
import { formatCurrency } from "@/lib/utils";

type OrderProps = {
  onSubmit: (formData: OrderDraftType) => void;
};

export default function CreateOrderForm({ onSubmit }: OrderProps) {
  const [isOpen, setIsOpen] = useState(true);

  const form = useForm<OrderDraftType>({
    resolver: zodResolver(orderDraftSchema),
    defaultValues: {
      note: "",
      subtotal: 0,
      discountAmount: 0,
      quantity: 0,
      discount: undefined,
      items: [],
    },
  });

  const { control, setValue, reset } = form;

  const watchedDiscount = useWatch({
    control: form.control,
    name: "discount",
  });

  const watchedQuantity = useWatch({
    control: form.control,
    name: "quantity",
  });

  const watchedDiscountAmount = useWatch({
    control: form.control,
    name: "discountAmount",
  });

  const watchedSubtotal = useWatch({
    control: form.control,
    name: "subtotal",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  });

  const handleQuantityChange = (index: number, quantity: number) => {
    const item = form.getValues(`items.${index}`);
    const { unitPrice, discount } = item;

    const { subtotal, discountAmount } = calculateDiscountAmount(
      quantity,
      unitPrice,
      discount
    );

    const allItems = form.getValues("items");
    const totalQuantity = allItems.reduce((acc, item, i) => {
      return acc + (i === index ? quantity : item.quantity);
    }, 0);
    form.setValue(`quantity`, totalQuantity);

    form.setValue(`items.${index}.subtotal`, subtotal);
    form.setValue(`items.${index}.discountAmount`, discountAmount);
  };

  const handleChangeUnitPrice = (index: number, unitPrice: number) => {
    const item = form.getValues(`items.${index}`);
    const { quantity, discount } = item;

    const { discountAmount, subtotal } = calculateDiscountAmount(
      quantity,
      unitPrice,
      discount
    );

    const allItems = form.getValues("items");
    const orderSubtotal = allItems.reduce((acc, item, i) => {
      return acc + (i === index ? unitPrice : item.unitPrice);
    }, 0);

    form.setValue(`subtotal`, orderSubtotal);
    form.setValue(`items.${index}.subtotal`, subtotal);
    form.setValue(`items.${index}.discountAmount`, discountAmount);
  };

  const handleAddProduct = (product: ProductType) => {
    if (product.quantity <= 0) {
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

    const { subtotal, discountAmount } = calculateDiscountAmount(
      1,
      product?.defaultOrderPrice ?? 0
    );

    append({
      quantity: 1,
      itemableId: product.id,
      itemableType: "Product",
      discount: undefined,
      name: product.name,
      availableQuantity: product.quantity,
      description: product.description,
      unitPrice: product.defaultOrderPrice ?? 0,
      subtotal: subtotal,
      discountAmount: discountAmount,
    });

    setValue("quantity", watchedQuantity + 1);
    setValue("subtotal", watchedSubtotal + (product.defaultOrderPrice ?? 0));

    toast.success(`Add product "${product.name}" success!`);
  };

  const handleAddService = (service: ServiceType) => {
    const selectedServices = form.getValues("items");

    const alreadyExists = selectedServices.some(
      (selectedService) =>
        selectedService.itemableType === "Service" &&
        selectedService.itemableId === service.id
    );

    if (alreadyExists) {
      toast.error("Service already added!");
      return;
    }

    append({
      quantity: 1,
      itemableId: service.id,
      itemableType: "Service",
      discount: undefined,
      name: service.name,
      description: service.description,
      unitPrice: service.unitPrice,
      subtotal: service.unitPrice,
      discountAmount: 0,
    });

    setValue("quantity", watchedQuantity + 1);
    setValue("subtotal", watchedSubtotal + service.unitPrice);

    toast.success(`Add service "${service.name}" success!`);
  };

  const handleAddCourse = (course: CourseType) => {
    const selectedCourses = form.getValues("items");

    const alreadyExists = selectedCourses.some(
      (selectedCourse) =>
        selectedCourse.itemableType === "Course" &&
        selectedCourse.itemableId === course.id
    );

    if (alreadyExists) {
      toast.error("Course already added!");
      return;
    }

    append({
      quantity: 1,
      itemableId: course.id,
      itemableType: "Course",
      discount: undefined,
      name: course.name,
      description: course.description,
      unitPrice: course.price,
      subtotal: course.price,
      discountAmount: 0,
    });

    setValue("quantity", watchedQuantity + 1);
    setValue("subtotal", watchedSubtotal + course.price);

    toast.success(`Add course "${course.name}" success!`);
  };

  const handleRemoveItem = (index: number) => {
    const items = form.getValues("items");

    if (!items || !items[index]) return;

    const item = items[index];
    const itemSubtotal =
      (item.subtotal ?? item.quantity * item.unitPrice) -
      (item.discountAmount ?? 0);

    setValue("quantity", watchedQuantity - item.quantity);
    setValue("subtotal", watchedSubtotal - itemSubtotal);

    remove(index);

    toast.success(`Remove item success!`);
  };

  const calculateDiscountAmount = (
    quantity: number,
    unitPrice: number,
    discount?: DiscountType
  ) => {
    const subtotal = unitPrice * quantity;
    let discountAmount = 0;
    if (discount) {
      if (discount.type === "Fixed") discountAmount = discount.value;
      else discountAmount = subtotal * (discount.value / 100);
    }

    // Check if item not satisfy discount condition
    if (discount?.minTotalValue && subtotal < discount.minTotalValue)
      return {
        discountAmount: 0,
        subtotal,
      };

    // Calculate discount amount if discount has maxDiscountAmount
    if (
      discount?.maxDiscountAmount &&
      discountAmount > discount.maxDiscountAmount
    )
      discountAmount = discount.maxDiscountAmount;
    return {
      discountAmount,
      subtotal,
    };
  };

  const handleAddDiscount = (discount: DiscountType, index?: number) => {
    if (index !== undefined) {
      const currentItems = form.getValues("items");
      const item = currentItems[index];

      const { discountAmount, subtotal } = calculateDiscountAmount(
        item.quantity,
        item.unitPrice,
        discount
      );

      // Order subtotal plus old discount amount of item
      form.setValue("subtotal", watchedSubtotal + (item?.discountAmount ?? 0));

      update(index, {
        ...item,
        discount,
        subtotal,
        discountAmount,
      });

      // Order subtotal minus new discount amount of item
      form.setValue("subtotal", watchedSubtotal - discountAmount);
    } else {
      form.setValue("discount", discount);
    }

    toast.success(`Add discount success!`);
  };

  const handleRemoveDiscount = (index?: number) => {
    // Remove discount of item
    if (index !== undefined) {
      const itemPath = `items.${index}` as const;
      const currentItem = form.getValues(itemPath);

      form.setValue(
        "subtotal",
        watchedSubtotal + (currentItem.discountAmount ?? 0)
      );

      form.setValue(`${itemPath}.discount`, undefined);
      form.setValue(`${itemPath}.discountAmount`, 0);
      form.setValue(
        `${itemPath}.subtotal`,
        currentItem.quantity * currentItem.unitPrice
      );

      toast.success("Remove item discount success!");
      return;
    }

    form.setValue("discountAmount", 0);
    form.setValue("discount", undefined);
    toast.success("Remove order discount success!");
  };

  const calculateOrder = () => {
    const items = form.getValues("items");

    let orderQuantity = 0;
    let orderSubtotal = 0;

    items.forEach((item) => {
      orderQuantity += item.quantity;
      orderSubtotal += item.subtotal - (item.discountAmount ?? 0);
    });

    const { discountAmount } = calculateDiscountAmount(
      1,
      orderSubtotal,
      watchedDiscount
    );

    return {
      quantity: orderQuantity,
      subtotal: orderSubtotal > 0 ? orderSubtotal : 0,
      discountAmount,
    };
  };

  useEffect(() => {
    const result = calculateOrder();

    const currentSubtotal = form.getValues("subtotal");
    const currentDiscountAmount = form.getValues("discountAmount");
    const currentQuantity = form.getValues("quantity");

    if (
      currentDiscountAmount !== result.discountAmount ||
      currentSubtotal !== result.subtotal ||
      currentQuantity !== result.quantity
    ) {
      setValue(
        "discountAmount",
        result.discountAmount >= 0 ? result.discountAmount : 0,
        { shouldDirty: false }
      );
      setValue("subtotal", result.subtotal >= 0 ? result.subtotal : 0, {
        shouldDirty: false,
      });
      setValue("quantity", result.quantity >= 0 ? result.quantity : 0, {
        shouldDirty: false,
      });
    }
  }, [watchedItems, watchedDiscount, watchedSubtotal]);

  const onInternalSubmit = (data: OrderDraftType) => {
    onSubmit(data);
    reset();
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onInternalSubmit)}
        className="space-y-4 text-xl h-full w-full"
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-6 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Create Order
              </h1>
              <p className="text-gray-600">
                Fill in the details below to create a new order
              </p>
            </div>

            <div className="flex lg:flex-row flex-col gap-6">
              {/* Main Content Area */}
              <div className="flex-1 space-y-6">
                {/* Order Information Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Order Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Customer */}
                    <FormField
                      control={form.control}
                      name="customer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Customer
                          </FormLabel>
                          <FormControl>
                            <PartnerComboBox
                              value={field.value}
                              onChange={(partner) => field.onChange(partner)}
                              type="Customer"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Discount */}
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Order Discount
                          </FormLabel>
                          <FormControl>
                            <DiscountComboBox
                              value={field.value}
                              onChange={(discount) =>
                                field.onChange(discount ? discount : undefined)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                  </div>
                </div>

                {/* Items Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="flex md:flex-row flex-col md:min-h-[550px]">
                    {/* Add Items Sidebar */}
                    <div className="md:w-64 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 border-r border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
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
                        Add Items
                      </h3>
                      <AddItemRow
                        handleAddProduct={handleAddProduct}
                        handleAddService={handleAddService}
                        handleAddCourse={handleAddCourse}
                        source={"Order"}
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
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          Order Items
                          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                            <p className="text-lg font-medium">
                              No items added yet
                            </p>
                            <p className="text-sm">
                              Add products, services, or courses to get started
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
                                  Item Name
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
                                  <React.Fragment key={field.id}>
                                    <TableRow className="hover:bg-gray-50 transition-colors">
                                      <TableCell className="font-medium text-gray-900">
                                        {watchedItems?.[index]?.name}
                                      </TableCell>

                                      {/* Quantity */}
                                      <TableCell className="w-24">
                                        <FormField
                                          control={form.control}
                                          name={`items.${index}.quantity`}
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
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
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
                                      <TableCell className="font-semibold text-blue-600">
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
                                          onClick={() =>
                                            handleRemoveItem(index)
                                          }
                                          className="hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                        >
                                          <X size={18} />
                                        </Button>
                                      </TableCell>
                                    </TableRow>

                                    <TableRow className="bg-blue-50/30 border-b-2 border-blue-100">
                                      <TableCell colSpan={3}>
                                        <div className="flex items-center gap-2">
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
                                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                            />
                                          </svg>
                                          <DiscountComboBox
                                            value={
                                              watchedItems?.[index]?.discount
                                            }
                                            onChange={(discount) => {
                                              if (discount)
                                                handleAddDiscount(
                                                  discount,
                                                  index
                                                );
                                              else handleRemoveDiscount(index);
                                            }}
                                          />
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right font-semibold text-red-600">
                                        {watchedItems?.[index]?.discountAmount
                                          ? `- ${formatCurrency(
                                              watchedItems?.[index]
                                                ?.discountAmount ?? 0
                                            )}`
                                          : "-"}
                                      </TableCell>
                                      <TableCell colSpan={2} />
                                    </TableRow>
                                  </React.Fragment>
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
                          Order Items
                          <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
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
                                <CardHeader className="flex flex-row justify-between items-start pb-3 bg-gradient-to-r from-gray-50 to-white">
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

                                  {/* Discount */}
                                  <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-gray-600 font-medium flex items-center gap-1">
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
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                          />
                                        </svg>
                                        Discount
                                      </span>
                                      <DiscountComboBox
                                        value={watchedItems?.[index]?.discount}
                                        onChange={(discount) => {
                                          if (discount)
                                            handleAddDiscount?.(
                                              discount,
                                              index
                                            );
                                          else handleRemoveDiscount?.(index);
                                        }}
                                      />
                                    </div>

                                    {/* Discount amount */}
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 text-xs">
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
                                  </div>
                                </CardContent>

                                <CardFooter className="flex justify-between font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-base">
                                  <span className="text-gray-700">Total</span>
                                  <span className="text-blue-600">
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

              {/* Order Summary Sidebar */}
              <div className="lg:w-96 w-full">
                <div className="sticky top-6">
                  <Card className="shadow-xl border-gray-200 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
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
                        Order Summary
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 p-6">
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
                          Total Items
                        </span>
                        <span className="font-semibold text-gray-900 text-lg">
                          {watchedQuantity}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold text-gray-900 text-lg">
                          {formatCurrency(watchedSubtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Discount
                        </span>
                        <span className="font-semibold text-red-600 text-lg">
                          - {formatCurrency(watchedDiscountAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 mt-2">
                        <span className="font-bold text-gray-900 text-lg">
                          Total Amount
                        </span>
                        <span className="font-bold text-blue-600 text-2xl">
                          {formatCurrency(
                            watchedSubtotal - watchedDiscountAmount > 0
                              ? watchedSubtotal - watchedDiscountAmount
                              : 0
                          )}
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg"
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
                        Create Order
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
