import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  itemDraftListSchema,
  type ItemDraftListType,
} from "../schemas/item.schema";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { useState } from "react";
import type { ProductType } from "../schemas/product.schema";
import type { ServiceType } from "../schemas/service.schema";
import AddDiscount from "@/pages/AddDiscount";
import type { DiscountType } from "../schemas/discount.schema";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import AddItemRow from "../commands/items.command";
import type { CourseType } from "../schemas/course.schema";
import { toast } from "sonner";
import { X } from "lucide-react";

type AddItemProps = {
  onSubmit: (itemDraftTypes: ItemDraftListType) => void;
  source: "Order" | "Purchase" | "Consignment";
};

const AddItemForm = ({ onSubmit, source }: AddItemProps) => {
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const form = useForm<ItemDraftListType>({
    resolver: zodResolver(itemDraftListSchema),
    defaultValues: {
      total: 0,
      quantity: 0,
      items: [],
    },
  });

  const { control, setValue } = form;

  const watchedQuantity = useWatch({
    control: form.control,
    name: "quantity",
  });

  const watchedTotal = useWatch({
    control: form.control,
    name: "total",
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
    setValue("total", watchedTotal + (product.defaultOrderPrice ?? 0));

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
    setValue("total", watchedTotal + service.unitPrice);

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
    setValue("total", watchedTotal + course.price);

    toast.success(`Add course "${course.name}" success!`);
  };

  const handleRemoveItem = (index: number) => {
    const item = form.getValues(`items.${index}`);

    setValue("quantity", watchedQuantity - item.quantity);
    setValue(
      "total",
      watchedTotal - (item.subtotal - (item.discountAmount ?? 0))
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

  const handleAddDiscount = (discount: DiscountType, index: number) => {
    const currentItems = form.getValues("items");
    const item = currentItems[index];

    const { discountAmount, subtotal } = calculateDiscountAmount(
      item.quantity,
      item.unitPrice,
      discount
    );

    // Order subtotal plus old discount amount of item
    form.setValue("total", watchedTotal + (item?.discountAmount ?? 0));

    update(index, {
      ...item,
      discount,
      subtotal,
      discountAmount,
    });

    // Order subtotal minus new discount amount of item
    form.setValue("total", watchedTotal - discountAmount);
    setOpenDialogIndex(null);

    toast.success(`Add discount success!`);
  };

  const handleRemoveDiscount = (index: number) => {
    const itemPath = `items.${index}` as const;
    const currentItem = form.getValues(itemPath);

    form.setValue("total", watchedTotal + (currentItem.discountAmount ?? 0));

    form.setValue(`${itemPath}.discount`, undefined);
    form.setValue(`${itemPath}.discountAmount`, 0);
    form.setValue(
      `${itemPath}.subtotal`,
      currentItem.quantity * currentItem.unitPrice
    );

    toast.success("Remove item discount success!");
  };

  const handleChangeUnitPrice = (index: number, unitPrice: number) => {
    const item = form.getValues(`items.${index}`);

    const itemSubtotal = unitPrice * item.quantity;

    const allItems = form.getValues("items");
    const total = allItems.reduce((acc, item, i) => {
      return acc + (i === index ? unitPrice : item.unitPrice);
    }, 0);

    form.setValue(`total`, total);
    form.setValue(`items.${index}.subtotal`, itemSubtotal);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 overflow-y-auto flex flex-row"
        >
          {/* Item List */}
          <div className="flex flex-1/3 space-y-5 h-full">
            <AddItemRow
              handleAddProduct={handleAddProduct}
              handleAddService={handleAddService}
              handleAddCourse={handleAddCourse}
              source={source}
            ></AddItemRow>
          </div>

          {/* Selected Item List */}
          <div>
            <div className="flex flex-col flex-1/3 p-4 space-y-5 justify-start items-end  w-full max-h-[550px] overflow-auto">
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
                  {source === "Order" && (
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
                  )}

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
            <Button type="submit" className="w-full">
              Add
            </Button>
          </div>
          {/* )} */}
        </form>
      </Form>
    </>
  );
};

export default AddItemForm;
