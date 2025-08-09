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
  consignmentDraftSchema,
  type ConsignmentDraftType,
} from "@/components/schemas/source.schema";
import { toast } from "sonner";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductType } from "../schemas/product.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PartnerComboBox } from "../comboBoxs/partner.comboBox";
import { UserComboBox } from "../comboBoxs/user.comboBox";
import AddItemRow from "../commands/items.command";

type ConsignmentProps = {
  onSubmit: (formData: ConsignmentDraftType) => void;
};

export default function CreateConsignmentForm({ onSubmit }: ConsignmentProps) {
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
      if (item.itemableType !== "Product") return;

      const newUnitPrice =
        watchedType === "In"
          ? item.defaultPurchasePrice
          : item.defaultOrderPrice;

      form.setValue(`items.${idx}.unitPrice`, newUnitPrice);
      form.setValue(`items.${idx}.subtotal`, newUnitPrice * item.quantity);
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
        className="space-y-4 text-xl h-full w-full"
      >
        <div className="flex md:flex-row flex-col text-sm md:text-xl">
          {/* General Information */}
          <div className="flex flex-1/3 flex-col space-y-5 px-5">
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

            <div className="flex md:flex-row flex-col gap-5">
              {/* Discount Amount */}
              <FormField
                control={form.control}
                name="commissionRate"
                render={({ field }) => (
                  <FormItem>
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
                            e.target.value === "" ? "" : Number(e.target.value)
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
                  <FormItem className="flex flex-col flex-1/2">
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

            {/* Partner */}
            <FormField
              control={form.control}
              name="partner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner</FormLabel>
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
            )}

            {/* Consignment Discount */}
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
          </div>

          {/* Item List */}
          <div className="flex flex-1/3 space-y-5 h-full">
            <AddItemRow
              handleAddProduct={handleAddProduct}
              type={"Consignment"}
            ></AddItemRow>
          </div>

          {/* Item Lists */}
          <div className="flex flex-1/3 space-y-5">
            {watchedItems.length !== 0 && (
              <>
                <div className="flex flex-col p-4 space-y-5 justify-start items-end w-full max-h-[550px] overflow-auto">
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
                        <span>Unit Price: </span>
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

                      {/* Item Total */}
                      <CardContent className="flex justify-between border-t-2 pt-2">
                        <h1 className="font-bold">Total: </h1>
                        <span>{}</span>
                        <span>
                          {watchedItems?.[index]?.subtotal.toLocaleString(
                            "vi-VN",
                            {
                              style: "currency",
                              currency: "VND",
                            }
                          )}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full">
          Create Consignment
        </Button>
      </form>
    </Form>
  );
}
