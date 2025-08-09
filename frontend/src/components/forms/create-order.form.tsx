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
} from "@/components/schemas/source.schema";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import AddDiscount from "@/pages/AddDiscount";
import { Button } from "@/components/ui/button";
import { type ProductType } from "../schemas/product.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ServiceType } from "../schemas/service.schema";
import type { DiscountType } from "../schemas/discount.schema";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Banknote,
  Barcode,
  ChevronsUpDown,
  Edit,
  Percent,
  Tag,
  X,
} from "lucide-react";
import { PartnerComboBox } from "../comboBoxs/partner.comboBox";
import AddItemRow from "../commands/items.command";
import type { CourseType } from "../schemas/course.schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

type OrderProps = {
  onSubmit: (formData: OrderDraftType) => void;
};

export default function CreateOrderForm({ onSubmit }: OrderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
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
      product?.defaultOrderPrice ?? 0
    );

    append({
      quantity: 1,
      itemableId: product.id,
      itemableType: "Product",
      discount: undefined,
      name: product.name,
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
    const item = form.getValues(`items.${index}`);

    setValue("quantity", watchedQuantity - item.quantity);
    setValue(
      "subtotal",
      watchedSubtotal - (item.subtotal - (item.discountAmount ?? 0))
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
      form.setValue("subtotal", watchedSubtotal + (item?.discountAmount ?? 0));

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
      subtotal: orderSubtotal >= 0 ? orderSubtotal : 0,
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

  const handleChangeUnitPrice = (index: number, unitPrice: number) => {
    const item = form.getValues(`items.${index}`);

    const itemSubtotal = unitPrice * item.quantity;

    const allItems = form.getValues("items");
    const orderSubtotal = allItems.reduce((acc, item, i) => {
      return acc + (i === index ? unitPrice : item.unitPrice);
    }, 0);

    form.setValue(`subtotal`, orderSubtotal);
    form.setValue(`items.${index}.subtotal`, itemSubtotal);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onInternalSubmit)}
        className="space-y-4 text-xl h-full w-full "
      >
        <div className="flex md:flex-row flex-col text-sm md:text-xl">
          {/* General Information */}
          <div className="flex flex-1/4 flex-col space-y-5 px-5">
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

          {/* Item List */}
          <div className="flex flex-1/4 space-y-5 h-full">
            <AddItemRow
              handleAddProduct={handleAddProduct}
              handleAddService={handleAddService}
              handleAddCourse={handleAddCourse}
              source={"Order"}
            ></AddItemRow>
          </div>

          {/* Selected Item List RAW */}
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="flex flex-col gap-2 flex-1/2"
          >
            <div className="flex items-center justify-between gap-4 px-4">
              <h4 className="text-md font-bold">
                Order items ({watchedItems.length})
              </h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <ChevronsUpDown />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex flex-col gap-2">
              <div className="flex flex-col p-4 space-y-5 justify-start items-end w-full max-h-[500px] overflow-auto">
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

                    {/* Subtotal */}
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

                    <CardContent className="flex justify-between border-t-2 pt-2">
                      <span>Subtotal:</span>
                      <span>{watchedItems?.[index]?.subtotal || 0}</span>
                    </CardContent>

                    {/* Item Discount */}
                    <CardContent className="flex flex-col border-t-2 pt-2">
                      {watchedItems?.[index]?.discount ? (
                        <>
                          <div className="flex justify-between">
                            <span>Discount Code:</span>
                            <span>{watchedItems?.[index]?.discount.code}</span>
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
                          (watchedItems?.[index]?.discountAmount ?? 0) >
                        0
                          ? watchedItems?.[index]?.subtotal -
                            (watchedItems?.[index]?.discountAmount ?? 0)
                          : 0}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

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

        <Button type="submit" className="w-full">
          Create Order
        </Button>
      </form>
    </Form>
  );
}
