"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  purchaseDraftSchema,
  type PurchaseDraftType,
} from "@/components/schemas/source.schema";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductType } from "../schemas/product.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { ChevronsUpDown, X } from "lucide-react";
import { PartnerComboBox } from "../comboBoxs/partner.comboBox";
import { UserComboBox } from "../comboBoxs/user.comboBox";
import AddItemRow from "../commands/items.command";
import { formatCurrency } from "@/lib/utils";

type PurchaseProps = {
  onSubmit: (formData: PurchaseDraftType) => void;
};

export default function CreatePurchaseForm({ onSubmit }: PurchaseProps) {
  const [isOpen, setIsOpen] = useState(true);

  const form = useForm<PurchaseDraftType>({
    resolver: zodResolver(purchaseDraftSchema),
    defaultValues: {
      note: "",
      subtotal: 0,
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

    append({
      quantity: 1,
      itemableId: product.id,
      itemableType: "Product",
      name: product.name,
      description: product.description,
      unitPrice: product.defaultPurchasePrice!,
      availableQuantity: product.quantity,
      subtotal: product.defaultPurchasePrice!,
      discountAmount: 0,
    });

    setValue("quantity", watchedQuantity + 1);
    setValue("subtotal", watchedSubtotal + product.defaultPurchasePrice!);

    toast.success(`Add product "${product.name}" success!`);
  };

  const handleRemoveItem = (index: number) => {
    const item = form.getValues(`items.${index}`);

    setValue("quantity", watchedQuantity - item.quantity);
    setValue("subtotal", watchedSubtotal - item.subtotal);

    remove(index);
    toast.success(`Remove item success!`);
  };

  const calculatePurchase = () => {
    const items = form.getValues("items");
    let purchaseQuantity = 0;
    let purchaseSubtotal = 0;

    items.forEach((item) => {
      purchaseQuantity += item.quantity;
      purchaseSubtotal += item.subtotal;
    });

    return {
      quantity: purchaseQuantity,
      subtotal: purchaseSubtotal,
    };
  };

  const handleChangeUnitPrice = (index: number, unitPrice: number) => {
    const item = form.getValues(`items.${index}`);

    const itemSubtotal = unitPrice * item.quantity;

    const allItems = form.getValues("items");
    const purchaseSubtotal = allItems.reduce((acc, item, i) => {
      return acc + (i === index ? unitPrice : item.unitPrice);
    }, 0);

    form.setValue(`subtotal`, purchaseSubtotal);
    form.setValue(`items.${index}.subtotal`, itemSubtotal);
  };

  useEffect(() => {
    const result = calculatePurchase();

    const currentSubtotal = form.getValues("subtotal");
    const currentQuantity = form.getValues("quantity");

    if (
      currentSubtotal !== result.subtotal ||
      currentQuantity !== result.quantity
    ) {
      setValue("subtotal", result.subtotal >= 0 ? result.subtotal : 0);
      setValue("quantity", result.quantity >= 0 ? result.quantity : 0);
    }
  }, [watchedQuantity, watchedSubtotal]);

  const onInternalSubmit = async (data: PurchaseDraftType) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onInternalSubmit)}
        className="space-y-4 text-xl h-full w-full"
      >
        <div className="flex md:flex-row flex-col text-sm md:text-xl gap-4">
          <div className="flex flex-col md:flex-3/4 space-y-5 px-3">
            {/* General Information */}
            <div className="flex md:flex-row justify-between gap-5 flex-col">
              {/* Supplier */}
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem className="flex-1/4">
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <PartnerComboBox
                        value={field.value}
                        onChange={(partner) => field.onChange(partner)}
                        type="Supplier"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payer */}
              <FormField
                control={form.control}
                name="payer"
                render={({ field }) => (
                  <FormItem className="flex-1/4">
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

              {/* Note */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="flex-1/4">
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Purchase Discount Amount */}
              <FormField
                control={form.control}
                name="discountAmount"
                render={({ field }) => (
                  <FormItem className="flex-1/4">
                    <FormLabel>Discount Amount</FormLabel>
                    <FormControl>
                      <Input
                        step={"any"}
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                      />
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
                  handleAddService={undefined}
                  handleAddCourse={undefined}
                  source={"Purchase"}
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
                    <TableHeader className="sticky top-0 z-10">
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
                <CardTitle>Purchase Summary</CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between">
                <span>Quantity: </span>
                <span>{watchedQuantity}</span>
              </CardContent>
              <CardContent className="flex justify-between">
                <span>Subtotal: </span>
                <span>{watchedSubtotal}</span>
              </CardContent>
              <CardContent className="flex justify-between">
                <span>Discount:</span>
                <span> {watchedDiscountAmount}</span>
              </CardContent>

              <CardContent className="flex justify-between bpurchase-t-2 pt-2">
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
              Create Purchase
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
