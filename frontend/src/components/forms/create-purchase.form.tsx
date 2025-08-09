"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductType } from "../schemas/product.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { X } from "lucide-react";
import { PartnerComboBox } from "../comboBoxs/partner.comboBox";
import { UserComboBox } from "../comboBoxs/user.comboBox";
import AddItemRow from "../commands/items.command";

type PurchaseProps = {
  onSubmit: (formData: PurchaseDraftType) => void;
};

export default function CreatePurchaseForm({ onSubmit }: PurchaseProps) {
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
        <div className="flex md:flex-row flex-col text-sm md:text-xl">
          {/* General Information */}
          <div className="flex flex-1/2 flex-col space-y-5 px-5">
            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount Amount */}
            <FormField
              control={form.control}
              name="discountAmount"
              render={({ field }) => (
                <FormItem>
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

            {/* Supplier */}
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
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
                <FormItem>
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

            {/* Purchase Discount */}
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
                <span>Discount amount:</span>
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
          </div>

          {/* Item List */}
          <div className="flex flex-1/3 space-y-5 h-full">
            <AddItemRow
              handleAddProduct={handleAddProduct}
              source={"Purchase"}
            ></AddItemRow>
          </div>

          {/* Selected Item Lists */}
          <div className=" flex flex-1/3 space-y-5  w-full max-h-[550px] overflow-auto">
            {watchedItems.length !== 0 && (
              <>
                <div className="flex flex-col flex-1/3 p-4 space-y-5 justify-start items-end">
                  {fields.map((item, index) => (
                    <Card key={item.id} className="w-full">
                      <CardHeader>
                        <CardTitle>
                          {item.itemableType} {item.name}
                        </CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                        <CardAction>
                          <div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleRemoveItem(index)}
                              className="hover:bg-red-200 hover:text-red-500"
                            >
                              <X size={28} />
                            </Button>
                          </div>
                        </CardAction>
                      </CardHeader>

                      {/* Quanity */}
                      <CardContent className="flex justify-between">
                        <span>Quantity: </span>
                        <Input
                          type="number"
                          min={1}
                          {...form.register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                            onChange: (e) => {
                              const quantity = Number(e.target.value);
                              handleQuantityChange(index, quantity);
                            },
                          })}
                          className="w-20 inline-block"
                        />
                      </CardContent>

                      {/* Unit Price */}
                      <CardContent className="flex justify-between">
                        <span>Unit Price</span>
                        <Input
                          type="number"
                          min={1}
                          {...form.register(`items.${index}.unitPrice`, {
                            valueAsNumber: true,
                            onChange: (e) => {
                              const unitPrice = Number(e.target.value);
                              handleChangeUnitPrice(index, unitPrice);
                            },
                          })}
                          className="w-20 inline-block"
                        />
                      </CardContent>

                      {/* Subtotal */}
                      <CardContent className="flex justify-between bpurchase-t-2 pt-2">
                        <span>Subtotal:</span>
                        <span>{watchedItems?.[index]?.subtotal || 0}</span>
                      </CardContent>

                      {/* Item Discount */}

                      {/* Item Total */}
                      <CardContent className="flex justify-between bpurchase-t-2 pt-2">
                        <h1 className="font-bold">Total: </h1>
                        <span>{watchedItems?.[index]?.subtotal}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full">
          Create Purchase
        </Button>
      </form>
    </Form>
  );
}
