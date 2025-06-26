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
  orderDraftSchema,
  type OrderDraftType,
} from "@/components/schemas/source";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import AddDiscount from "@/pages/AddDiscount";
import { Button } from "@/components/ui/button";
import type { ProductType } from "../schemas/product";
import type { PartnerType } from "../schemas/partner";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ServiceType } from "../schemas/service";
import CreateItemRow from "@/pages/CreateItemRow";
import type { DiscountType } from "../schemas/discount";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Banknote,
  Barcode,
  Edit,
  Mail,
  Percent,
  Phone,
  Plus,
  Tag,
  User,
  X,
} from "lucide-react";
import ChooseCustomerSupplier from "../ChooseCustomerSupplier";

type OrderProps = {
  onSubmit: (formData: OrderDraftType) => void;
};

export default function CreateOrderForm({ onSubmit }: OrderProps) {
  const [isShowAddItem, setIsShowAddItem] = useState(false);
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openCustomerDialog, setOpenCustomerDialog] = useState<boolean>(false);
  const [openOrderDiscountDialog, setOpenOrderDiscountDialog] =
    useState<boolean>(false);

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

    const { subtotal, discountAmount } = calculateDiscountAmount(
      1,
      product.unitPrice
    );

    append({
      quantity: 1,
      itemableId: product.id,
      itemableType: "Product",
      discount: undefined,
      name: product.name,
      description: product.description,
      unitPrice: product.unitPrice,
      subtotal: subtotal,
      discountAmount: discountAmount,
    });

    setValue("quantity", watchedQuantity + 1);
    setValue("subtotal", watchedSubtotal + product.unitPrice);

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

  const handleRemoveItem = (index: number) => {
    const item = form.getValues(`items.${index}`);

    setValue("quantity", watchedQuantity - item.quantity);
    setValue(
      "subtotal",
      watchedSubtotal - (item.subtotal - item.discountAmount)
    );

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

    // Min value of item to use this discount
    if (
      discount?.minTotalValue &&
      discount.maxDiscountAmount !== 0 &&
      discount.minTotalValue > subtotal
    )
      return {
        discountAmount,
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
      form.setValue("subtotal", watchedSubtotal + item.discountAmount);

      update(index, {
        ...item,
        discount,
        subtotal,
        discountAmount,
      });

      // Order subtotal minus new discount amount of item
      form.setValue("subtotal", watchedSubtotal - discountAmount);
      setOpenDialogIndex(null);
    } else {
      form.setValue("discount", discount);
      setOpenOrderDiscountDialog(false);
    }

    toast.success(`Add discount success!`);
  };

  const handleRemoveDiscount = (index?: number) => {
    if (index !== undefined) {
      console.log("hello", fields[index]);
      const { id, ...rest } = fields[index];

      form.setValue("subtotal", watchedSubtotal + rest.discountAmount);

      update(index, {
        ...rest,
        discount: undefined,
        subtotal: rest.quantity * rest.unitPrice,
        discountAmount: 0,
      });

      toast.success("Remove item discount success!");
    } else {
      form.setValue("discountAmount", 0);
      form.setValue("discount", undefined);
      toast.success("Remove order discount success!");
    }
  };

  const handleChooseCustomer = (customer: PartnerType) => {
    form.setValue("customer", customer);
    setOpenCustomerDialog(false);
    toast.success("Choose customer success!");
  };

  const calculateOrder = () => {
    const items = form.getValues("items");
    let orderQuantity = 0;
    let orderSubtotal = 0;

    items.forEach((item) => {
      orderQuantity += item.quantity;
      orderSubtotal += item.subtotal - item.discountAmount;
    });

    const { discountAmount } = calculateDiscountAmount(
      1,
      orderSubtotal,
      watchedDiscount
    );

    return {
      quantity: orderQuantity,
      subtotal: orderSubtotal,
      discountAmount,
    };
  };

  useEffect(() => {
    const result = calculateOrder();
    console.log(result);

    console.log("abc");
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
        result.discountAmount >= 0 ? result.discountAmount : 0
      );
      setValue("subtotal", result.subtotal >= 0 ? result.subtotal : 0);
      setValue("quantity", result.quantity >= 0 ? result.quantity : 0);
    }
  }, [watchedDiscount, watchedQuantity, watchedSubtotal]);

  const onInternalSubmit = async (data: OrderDraftType) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onInternalSubmit)}
        className="space-y-4 text-xl  h-full w-full"
      >
        <div className="flex md:flex-row flex-col">
          {/* Item Lists */}
          {watchedItems.length === 0 ? (
            // <Card className="flex flex-1 flex-row md:flex-2/3 justify-center items-center mb-5">
            <div className="mb-5 px-5">
              <Card className="mb-5 px-5 justify-center items-center">
                <CardContent className="justify-center items-center">
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

                          <Dialog
                            open={openDialogIndex === index}
                            onOpenChange={(isOpen) => {
                              if (!isOpen) {
                                setOpenDialogIndex(null);
                              }
                            }}
                          >
                            <DialogContent>
                              <DialogTitle></DialogTitle>
                              <AddDiscount
                                handleAddDiscount={handleAddDiscount}
                                itemId={index}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardAction>
                    </CardHeader>

                    {/* Button */}
                    <div>
                      <Dialog
                        open={openDialogIndex === index}
                        onOpenChange={(isOpen) => {
                          if (!isOpen) {
                            setOpenDialogIndex(null);
                          }
                        }}
                      >
                        <DialogContent>
                          <DialogTitle></DialogTitle>
                          <AddDiscount
                            handleAddDiscount={handleAddDiscount}
                            itemId={index}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>

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
                      <span>{item.unitPrice}</span>{" "}
                    </CardContent>

                    {/* Subtotal */}
                    <CardContent className="flex justify-between border-t-2 pt-2">
                      <span>Subtotal:</span>
                      <span>{watchedItems?.[index]?.subtotal || 0}</span>
                    </CardContent>

                    {/* Item Discount */}
                    <CardContent className="flex flex-col border-t-2 pt-2">
                      {item.discount ? (
                        <>
                          <div className="flex justify-between">
                            <span>Discount Code:</span>
                            <span>{item?.discount?.code ?? ""}</span>
                          </div>

                          <div className="flex justify-between">
                            <span>Discount Amount:</span>
                            <span>{watchedItems?.[index]?.discountAmount}</span>
                          </div>

                          <div className="text-right text-xl">
                            <Button
                              type="button"
                              variant="link"
                              onClick={() => handleRemoveDiscount(index)}
                              className="text-red-500 p-0"
                            >
                              Remove
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => {
                            setOpenDialogIndex(index);
                          }}
                          className="p-0 text-xl"
                        >
                          Add Discount?
                        </Button>
                      )}
                    </CardContent>

                    {/* Item Total */}
                    <CardContent className="flex justify-between border-t-2 pt-2">
                      <h1 className="font-bold">Total: </h1>
                      <span>
                        {watchedItems?.[index]?.subtotal -
                          watchedItems?.[index]?.discountAmount >
                        0
                          ? watchedItems?.[index]?.subtotal -
                            watchedItems?.[index]?.discountAmount
                          : 0}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

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

            {/* Customer */}
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Card>
                      {form.getValues("customer") ? (
                        <>
                          <CardHeader>
                            <CardTitle className="text-2xl">Customer</CardTitle>
                            <CardAction>
                              <Button
                                type="button"
                                onClick={() => {
                                  setOpenCustomerDialog(true);
                                }}
                                className="bg-transparent text-blue-500 hover:bg-blue-100"
                              >
                                <Edit />
                              </Button>
                            </CardAction>
                          </CardHeader>
                          {form.getValues("customer") ? "" : ""}
                          <CardContent className="flex flex-row space-x-3">
                            <User />
                            <p> {`${form.getValues("customer.fullName")}`}</p>
                          </CardContent>
                          <CardContent className="flex flex-row space-x-3">
                            <Mail />
                            <p> {`${form.getValues("customer.email")}`}</p>
                          </CardContent>
                          <CardContent className="flex flex-row space-x-3">
                            <Phone />
                            <p>
                              {" "}
                              {`${form.getValues("customer.phoneNumber")}`}
                            </p>
                          </CardContent>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => {
                            setOpenCustomerDialog(true);
                          }}
                        >
                          Add Customer
                        </Button>
                      )}
                    </Card>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Discount */}
            <Card>
              {watchedDiscount ? (
                <>
                  <CardHeader>
                    <CardTitle className="text-2xl">Discount</CardTitle>
                    <CardAction>
                      <Button
                        type="button"
                        onClick={() => {
                          setOpenOrderDiscountDialog(true);
                        }}
                        className="bg-transparent text-blue-500 hover:bg-blue-100"
                      >
                        <Edit />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveDiscount()}
                        className="hover:bg-red-100 "
                      >
                        <X size={28} className="text-red-500" />
                      </Button>
                    </CardAction>
                  </CardHeader>
                  {watchedDiscount ? "" : ""}
                  <CardContent className="flex flex-row space-x-3">
                    <Tag />
                    <p> {`${watchedDiscount?.name}`}</p>
                  </CardContent>
                  <CardContent className="flex flex-row space-x-3">
                    <Barcode />
                    <p> {`${watchedDiscount?.code}`}</p>
                  </CardContent>
                  <CardContent className="flex flex-row space-x-3">
                    {watchedDiscount?.type === "Fixed" ? (
                      <Banknote />
                    ) : (
                      <Percent />
                    )}
                    <p> {`${form.getValues("discount.value")}`}</p>
                  </CardContent>
                </>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setOpenOrderDiscountDialog(true);
                  }}
                >
                  Add Discount (Optional)
                </Button>
              )}
            </Card>

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
                <span>{watchedSubtotal}</span>
              </CardContent>
              <CardContent className="flex justify-between">
                <span>Discount amount:</span>
                <span> {watchedDiscountAmount}</span>
              </CardContent>

              <CardContent className="flex justify-between border-t-2 pt-2">
                <span className="font-bold">Total: </span>
                <span>
                  {watchedSubtotal - watchedDiscountAmount > 0
                    ? watchedSubtotal - watchedDiscountAmount
                    : 0}
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
                isService={true}
                handleAddProduct={handleAddProduct}
                handleAddService={handleAddService}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Choose Order Discount */}
        <Dialog
          open={openOrderDiscountDialog}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpenOrderDiscountDialog(false);
            }
          }}
        >
          <DialogContent className="w-fit p-6">
            <DialogTitle></DialogTitle>
            <div className="max-w-[90vw] max-h-[80vh] overflow-y-auto overflow-x-auto">
              <AddDiscount
                handleAddDiscount={handleAddDiscount}
                itemId={undefined}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Choose Customer Dialog */}
        <Dialog
          open={openCustomerDialog}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpenCustomerDialog(false);
            }
          }}
        >
          <DialogContent>
            <DialogTitle></DialogTitle>
            <div className="max-w-[90vw] max-h-[80vh] overflow-y-auto overflow-x-auto">
              <ChooseCustomerSupplier
                type={"Customer"}
                handleChoosePartner={handleChooseCustomer}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Button type="submit" className="w-full">
          Create Order
        </Button>
      </form>
    </Form>
  );
}
