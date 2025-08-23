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
        <div className="flex md:flex-row flex-col text-sm md:text-xl">
          <div className="flex flex-col md:flex-3/4 space-y-5 px-3">
            {/* General Information */}
            <div className="flex md:flex-row justify-between gap-5 flex-col">
              {/* Customer */}
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem className="flex-1/3">
                    <FormLabel>Customer</FormLabel>
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
                  <FormItem className="flex-1/3">
                    <FormLabel>Discount</FormLabel>
                    <FormControl>
                      <DiscountComboBox
                        value={field.value}
                        onChange={(discount) => field.onChange(discount)}
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
                  <FormItem className="flex-1/3">
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex md:flex-row flex-col md:h-[510px] gap-2">
              {/* Item Lists */}
              <div className="flex flex-1/4 text-sm md:h-full">
                <AddItemRow
                  handleAddProduct={handleAddProduct}
                  handleAddService={handleAddService}
                  handleAddCourse={handleAddCourse}
                  source={"Order"}
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
                    <TableHeader className="sticky top-0 z-10 bg-red-50">
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
                          <React.Fragment key={field.id}>
                            <TableRow>
                              <TableCell className="text-left px-3 py-2">
                                {watchedItems?.[index]?.name}
                              </TableCell>

                              {/* Quantity */}
                              <TableCell>
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
                                            let number = Number(e.target.value);
                                            if (!number) number = 1;
                                            field.onChange(number);
                                            handleQuantityChange(index, number);
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
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
                              <TableCell>
                                {formatCurrency(
                                  watchedItems?.[index]?.subtotal || 0
                                )}
                              </TableCell>

                              {/* Total */}
                              <TableCell>
                                {formatCurrency(
                                  watchedItems?.[index]?.subtotal -
                                    (watchedItems?.[index]?.discountAmount ??
                                      0) >
                                    0
                                    ? watchedItems?.[index]?.subtotal -
                                        (watchedItems?.[index]
                                          ?.discountAmount ?? 0)
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

                            <TableRow className="shadow-sm bg-gray-50">
                              <TableCell>
                                <DiscountComboBox
                                  value={watchedItems?.[index]?.discount}
                                  onChange={(discount) => {
                                    if (discount)
                                      handleAddDiscount(discount, index);
                                    else handleRemoveDiscount(index);
                                  }}
                                />
                              </TableCell>
                              <TableCell />
                              <TableCell />
                              <TableCell className="text-right px-3 py-1 font-semibold text-red-600">
                                {watchedItems?.[index]?.discountAmount
                                  ? formatCurrency(
                                      watchedItems?.[index]?.discountAmount ?? 0
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell />
                              <TableCell />
                            </TableRow>
                          </React.Fragment>
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

                          {/* Discount */}
                          <div className="flex justify-between border-t-2 pt-2">
                            <span>Discount</span>
                            <span>
                              <DiscountComboBox
                                value={watchedItems?.[index]?.discount}
                                onChange={(discount) => {
                                  if (discount)
                                    handleAddDiscount?.(discount, index);
                                  else handleRemoveDiscount?.(index);
                                }}
                              />
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
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between">
                <span>Quantity: </span>
                <span>{watchedQuantity}</span>
              </CardContent>
              <CardContent className="flex justify-between">
                <span>Subtotal: </span>
                <span>{formatCurrency(watchedSubtotal)}</span>
              </CardContent>
              <CardContent className="flex justify-between">
                <span>Discount:</span>
                <span> {formatCurrency(watchedDiscountAmount)}</span>
              </CardContent>

              <CardContent className="flex justify-between border-t-2 pt-2">
                <span className="font-bold">Total: </span>
                <span>
                  {formatCurrency(
                    watchedSubtotal - watchedDiscountAmount > 0
                      ? watchedSubtotal - watchedDiscountAmount
                      : 0
                  )}
                </span>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full">
              Create Order
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
