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
        <div className="flex md:flex-row flex-col text-sm md:text-xl">
          <div className="flex flex-col md:flex-3/4 space-y-5 px-3">
            {/* General Information */}
            <div className="flex md:flex-row justify-between gap-5 flex-col">
              <div className="flex flex-row gap-3">
                {/* Partner */}
                <FormField
                  control={form.control}
                  name="partner"
                  render={({ field }) => (
                    <FormItem className="flex-1/3">
                      <FormLabel>
                        {watchedType === "In" ? "Supplier" : "Customer"}
                      </FormLabel>
                      <FormControl>
                        <PartnerComboBox
                          value={field.value}
                          onChange={(partner) => field.onChange(partner)}
                          type={watchedType === "In" ? "Supplier" : "Customer"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Payer */}
                {watchedType === "In" && (
                  <FormField
                    control={form.control}
                    name="payer"
                    render={({ field }) => (
                      <FormItem className="flex-1/3">
                        <FormLabel>Payer</FormLabel>
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
                    <FormItem className="flex-1/3">
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* </div>
              <div className="flex flex-row gap-3 w-2/3"> */}
                {/* Commission Rate */}
                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem className="flex-1/3">
                      <FormLabel>Commission Rate</FormLabel>
                      <FormControl>
                        <Input
                          min={0}
                          max={100}
                          step={"any"}
                          type="number"
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
                    <FormItem className="flex-1/3">
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a type of consignment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup className="w-full">
                            <SelectItem value="In">In</SelectItem>
                            <SelectItem value="Out">Out</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex md:flex-row flex-col md:h-[510px] gap-2">
              {/* Item Lists */}
              <div className="flex flex-1/4 text-sm md:h-full">
                <AddItemRow
                  handleAddProduct={handleAddProduct}
                  handleAddService={undefined}
                  handleAddCourse={undefined}
                  source={"Consignment"}
                ></AddItemRow>
              </div>

              {/* Table */}
              {/* Selected item lists for device not mobile*/}
              <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className=" flex-col flex-3/4 w-full h-full border-2 md:ml-3 md:flex hidden"
              >
                <div className="bg-slate-200 py-3 px-2 flex items-center justify-between gap-4">
                  <h4 className="text-md font-bold">
                    ORDER ITEMS ({watchedItems.length})
                  </h4>

                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <ChevronsUpDown />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="flex-1 overflow-y-auto">
                  <Table>
                    <TableCaption>A list of your selected items.</TableCaption>
                    <TableHeader className="sticky top-0 z-10 ">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        return (
                          <TableRow key={field.id}>
                            <TableCell className="text-left px-3 py-2">
                              {watchedItems?.[index]?.name}
                            </TableCell>

                            {/* Quantity */}
                            <TableCell>
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
                                          let number = Number(e.target.value);
                                          if (!number) number = 1;
                                          field.onChange(number);
                                          handleQuantityChange(index, number);
                                        }}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormMessage></FormMessage>
                            </TableCell>

                            {/* Unit Price */}
                            <TableCell>
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
                                          const number = Number(e.target.value);
                                          field.onChange(number ?? 0);
                                        }}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </TableCell>

                            {/* Subtotal */}
                            <TableCell>
                              {formatCurrency(
                                watchedItems?.[index]?.subtotal || 0
                              )}
                            </TableCell>

                            {/* Total */}
                            <TableCell>
                              {formatCurrency(
                                watchedItems?.[index]?.subtotal -
                                  (watchedItems?.[index]?.discountAmount ?? 0) >
                                  0
                                  ? watchedItems?.[index]?.subtotal -
                                      (watchedItems?.[index]?.discountAmount ??
                                        0)
                                  : 0
                              )}
                            </TableCell>

                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveItem(index)}
                                className="hover:bg-red-200 hover:text-red-500"
                              >
                                <X size={20} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CollapsibleContent>
              </Collapsible>

              {/* Selected item lists for mobile*/}
              <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="flex flex-col flex-3/4 w-full h-full border-2 md:ml-3 md:hidden"
              >
                <div className="bg-slate-200 py-3 px-2 flex items-center justify-between gap-4">
                  <h4 className="text-md font-bold">
                    ORDER ITEMS ({watchedItems.length})
                  </h4>

                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <ChevronsUpDown />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="flex-1 overflow-y-auto">
                  {fields.map((field, index) => {
                    return (
                      <Card
                        key={field.id}
                        className="w-full max-w-sm text-md mb-4"
                      >
                        <CardHeader className="flex justify-between items-center">
                          <CardTitle>{watchedItems?.[index]?.name}</CardTitle>
                          <CardAction>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleRemoveItem(index)}
                              className="hover:bg-red-200 hover:text-red-500"
                            >
                              <X size={20} />
                            </Button>
                          </CardAction>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {/* Quantity */}
                          <div className="flex justify-between items-center">
                            <span>Quantity</span>
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
                                        let number = Number(e.target.value);
                                        if (!number) number = 1;
                                        field.onChange(number);
                                        handleQuantityChange(index, number);
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Unit Price */}
                          <div className="flex justify-between items-center">
                            <span>Unit Price</span>
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
                                        const number = Number(e.target.value);

                                        field.onChange(number ?? 0);
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Subtotal */}
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>
                              {formatCurrency(
                                watchedItems?.[index]?.subtotal ?? 0
                              )}
                            </span>
                          </div>

                          {/* Discount amount */}
                          <div className="flex justify-between border-b-2 pb-2">
                            <span>Discount amount</span>
                            <span>
                              {formatCurrency(
                                watchedItems?.[index]?.discountAmount ?? 0
                              )}
                            </span>
                          </div>
                        </CardContent>

                        <CardFooter className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>
                            {watchedItems?.[index]?.subtotal -
                              (watchedItems?.[index]?.discountAmount ?? 0) >
                            0
                              ? watchedItems?.[index]?.subtotal -
                                  (watchedItems?.[index]?.discountAmount ?? 0) >
                                0
                              : 0}
                          </span>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-1/4 px-3">
            <Card>
              <CardHeader>
                <CardTitle>Consignment Summary</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between">
                <span>Type: </span>
                <span>{watchedType}</span>
              </CardContent>
              <CardContent className="flex justify-between">
                <span>Quantity: </span>
                <span>{watchedQuantity}</span>
              </CardContent>
              <CardContent className="flex justify-between">
                <span>Subtotal: </span>
                <span>{watchedSubtotal}</span>
              </CardContent>
              <CardContent className="flex justify-between">
                <span>Commission Rate:</span>
                <span> {watchedCommissionRate}</span>
              </CardContent>

              <CardContent className="flex justify-between border-t-2 pt-2">
                <span className="font-bold">Total: </span>
                <span>
                  {watchedDiscountAmount
                    ? watchedSubtotal - watchedDiscountAmount > 0
                      ? watchedSubtotal - watchedDiscountAmount
                      : 0
                    : watchedSubtotal}
                </span>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full">
              Create Consignment
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
