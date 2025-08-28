import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  itemDraftListSchema,
  type ItemDraftListType,
} from "../schemas/item.schema";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import type { ProductType } from "../schemas/product.schema";
import type { ServiceType } from "../schemas/service.schema";
import type { DiscountType } from "../schemas/discount.schema";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "../ui/input";
import AddItemRow from "../commands/items.command";
import type { CourseType } from "../schemas/course.schema";
import { toast } from "sonner";
import { X } from "lucide-react";
import { DiscountComboBox } from "../comboBoxs/discount.comboBox";
import { formatCurrency } from "@/lib/utils";
type AddItemProps = {
  onSubmit: (itemDraftTypes: ItemDraftListType) => void;
  source: "Order" | "Purchase" | "Consignment";
};

const AddItemForm = ({ onSubmit, source }: AddItemProps) => {
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

  const handleAddDiscount = (discount: DiscountType, index: number) => {
    const currentItems = form.getValues("items");
    const item = currentItems[index];

    const { discountAmount, subtotal } = calculateDiscountAmount(
      item.quantity,
      item.unitPrice,
      discount
    );

    update(index, {
      ...item,
      discount,
      subtotal,
      discountAmount,
    });

    toast.success(`Add discount success!`);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
        >
          {/* Item List */}
          <div className="min-w-[220px] max-w-[340px] w-full p-4 rounded-xl shadow-md self-start overflow-x-auto max-h-[70vh] overflow-y-auto border">
            <AddItemRow
              handleAddProduct={handleAddProduct}
              handleAddService={handleAddService}
              handleAddCourse={handleAddCourse}
              source={source}
            />
          </div>

          {/* Selected Item List */}
          <div className="bg-white w-full max-h-[70vh] overflow-y-auto rounded-xl p-4 shadow-md border border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex flex-col gap-5 w-full">
              {/* Selected item lists for mobile*/}
              {fields.map((field, index) => {
                return (
                  <Card key={field.id} className="w-full max-w-sm text-md mb-4">
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
                                    const number = !val ? null : Number(val);
                                    field.onChange(number);
                                    handleQuantityChange(index, number ?? 1);
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
                                    const number = !val ? null : Number(val);
                                    field.onChange(number);
                                    handleChangeUnitPrice(index, number ?? 0);
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
                          {formatCurrency(watchedItems?.[index]?.subtotal ?? 0)}
                        </span>
                      </div>

                      {/* Discount */}
                      {source === "Order" && (
                        <div className="flex justify-between border-t-2 pt-2">
                          <span>Discount</span>
                          <div className="flex-1 min-w-[200px] max-w-full">
                            <DiscountComboBox
                              value={watchedItems?.[index]?.discount}
                              onChange={(discount) => {
                                if (discount)
                                  handleAddDiscount?.(discount, index);
                                else handleRemoveDiscount?.(index);
                              }}
                            />
                          </div>
                        </div>
                      )}

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
                        {Math.max(
                          (watchedItems?.[index]?.subtotal ?? 0) -
                            (watchedItems?.[index]?.discountAmount ?? 0),
                          0
                        ).toLocaleString()}
                      </span>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <Button
              type="submit"
              className="w-full mt-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-lg shadow transition-all"
            >
              Add
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default AddItemForm;
