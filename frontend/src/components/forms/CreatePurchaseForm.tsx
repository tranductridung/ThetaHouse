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
} from "@/components/schemas/source";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductType } from "../schemas/product";
import type { PartnerType } from "../schemas/partner";
import { zodResolver } from "@hookform/resolvers/zod";
import CreateItemRow from "@/pages/CreateItemRow";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Edit, Mail, Phone, Plus, User, X } from "lucide-react";
import ChooseCustomerSupplier from "../ChooseCustomerSupplier";

type PurchaseProps = {
  onSubmit: (formData: PurchaseDraftType) => void;
};

export default function CreatePurchaseForm({ onSubmit }: PurchaseProps) {
  const [isShowAddItem, setIsShowAddItem] = useState(false);
  const [openSupplierDialog, setOpenSupplierDialog] = useState<boolean>(false);
  useState<boolean>(false);

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
      unitPrice: product.defaultPurchasePrice,
      subtotal: product.defaultPurchasePrice,
      discountAmount: 0,
    });

    setValue("quantity", watchedQuantity + 1);
    setValue("subtotal", watchedSubtotal + product.defaultPurchasePrice);

    toast.success(`Add product "${product.name}" success!`);
  };

  const handleRemoveItem = (index: number) => {
    const item = form.getValues(`items.${index}`);

    setValue("quantity", watchedQuantity - item.quantity);
    setValue("subtotal", watchedSubtotal - item.subtotal);

    remove(index);
    toast.success(`Remove item success!`);
  };

  const handleChooseSupplier = (supplier: PartnerType) => {
    form.setValue("supplier", supplier);
    setOpenSupplierDialog(false);
    toast.success("Choose supplier success!");
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
          {/* Item Lists */}
          <div className=" flex flex-1/2 space-y-5">
            {watchedItems.length === 0 ? (
              <div className="mb-5 px-5 w-full">
                <Card className=" justify-center items-center w-full h-full">
                  <CardContent>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => {
                        setIsShowAddItem(true);
                      }}
                      className="text-xl m-auto"
                    >
                      Add New Item
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                <div className="flex flex-col flex-2/3 p-4 space-y-5 justify-start items-end">
                  {/* Add new item button */}
                  <Button
                    type="button"
                    onClick={() => {
                      setIsShowAddItem(true);
                    }}
                    className="w-fit rounded-full p-6 text-right"
                  >
                    <Plus />
                    {/* Add New Item */}
                  </Button>

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
                      type="number"
                      min={0}
                      {...form.register(`discountAmount`, {
                        valueAsNumber: true,
                      })}
                      className="w-full inline-block"
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
                  <FormControl>
                    <Card>
                      {form.getValues("supplier") ? (
                        <>
                          <CardHeader>
                            <CardTitle className="text-2xl">Supplier</CardTitle>
                            <CardAction>
                              <Button
                                type="button"
                                onClick={() => {
                                  setOpenSupplierDialog(true);
                                }}
                                className="bg-transparent text-blue-500 hover:bg-blue-100"
                              >
                                <Edit />
                              </Button>
                            </CardAction>
                          </CardHeader>
                          {form.getValues("supplier") ? "" : ""}
                          <CardContent className="flex flex-row space-x-3">
                            <User />
                            <p> {`${form.getValues("supplier.fullName")}`}</p>
                          </CardContent>
                          <CardContent className="flex flex-row space-x-3">
                            <Mail />
                            <p> {`${form.getValues("supplier.email")}`}</p>
                          </CardContent>
                          <CardContent className="flex flex-row space-x-3">
                            <Phone />
                            <p>
                              {" "}
                              {`${form.getValues("supplier.phoneNumber")}`}
                            </p>
                          </CardContent>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => {
                            setOpenSupplierDialog(true);
                          }}
                        >
                          Add Supplier
                        </Button>
                      )}
                    </Card>
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
        </div>

        <Dialog
          open={isShowAddItem}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setIsShowAddItem(false);
            }
          }}
        >
          <DialogContent>
            <DialogTitle>Add Item</DialogTitle>
            <div className="max-w-[90vw] max-h-[80vh] overflow-y-auto overflow-x-auto">
              <CreateItemRow
                isService={false}
                handleAddProduct={handleAddProduct}
                handleAddService={() => {}}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Choose Supplier Dialog */}
        <Dialog
          open={openSupplierDialog}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpenSupplierDialog(false);
            }
          }}
        >
          <DialogContent>
            <DialogTitle></DialogTitle>
            <div className="max-w-[90vw] max-h-[80vh] overflow-y-auto overflow-x-auto">
              <ChooseCustomerSupplier
                type={"Supplier"}
                handleChoosePartner={handleChooseSupplier}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Button type="submit" className="w-full">
          Create Purchase
        </Button>
      </form>
    </Form>
  );
}
