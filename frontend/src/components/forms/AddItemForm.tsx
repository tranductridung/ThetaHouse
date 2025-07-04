import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useForm, useWatch } from "react-hook-form";
import { itemDraftSchema, type ItemDraftType } from "../schemas/item";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import CreateItemRow from "@/pages/CreateItemRow";
import type { ProductType } from "../schemas/product";
import type { ServiceType } from "../schemas/service";
import AddDiscount from "@/pages/AddDiscount";
import type { DiscountType } from "../schemas/discount";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Edit } from "lucide-react";
import { Input } from "../ui/input";

type AddItemProps = {
  onSubmit: (itemDraftType: ItemDraftType) => void;
  isService: boolean;
};

const AddItemForm = ({ onSubmit, isService }: AddItemProps) => {
  const [isShowAddItem, setIsShowAddItem] = useState(false);
  const [isShowAddDiscount, setIsShowAddDiscount] = useState(false);
  const [total, setTotal] = useState<number>(0);

  const form = useForm<ItemDraftType>({
    resolver: zodResolver(itemDraftSchema),
    defaultValues: {
      itemableType: undefined,
      quantity: 1,
      discount: undefined,
      itemableId: undefined,
      name: undefined,
      description: undefined,
      unitPrice: undefined,
      discountAmount: 0,
      subtotal: undefined,
    },
  });

  const handleAddProduct = (product: ProductType) => {
    form.setValue("itemableType", "Product");
    form.setValue("itemableId", product.id);
    form.setValue("name", product.name);
    form.setValue("description", product.description ?? "");
    form.setValue("unitPrice", product.defaultOrderPrice);
    form.setValue("quantity", 1);
    form.setValue("discountAmount", 0);
    form.setValue("subtotal", product.defaultOrderPrice);
    setIsShowAddItem(false);
  };

  const handleAddService = (service: ServiceType) => {
    form.setValue("itemableType", "Service");
    form.setValue("itemableId", service.id);
    form.setValue("name", service.name);
    form.setValue("description", service.description ?? "");
    form.setValue("unitPrice", service.unitPrice);
    form.setValue("quantity", 1);
    form.setValue("discountAmount", 0);
    form.setValue("subtotal", service.unitPrice);
    setIsShowAddItem(false);
  };

  const handleAddDiscount = (discount: DiscountType) => {
    console.log(discount);
    form.setValue("discount", discount);

    const { subtotal, discountAmount } = calculateDiscountAmount(
      form.getValues("unitPrice"),
      form.getValues("quantity"),
      discount
    );

    form.setValue("subtotal", subtotal);
    form.setValue("discountAmount", discountAmount);

    setIsShowAddDiscount(false);
  };

  const watchedDiscountAmount = useWatch({
    control: form.control,
    name: "discountAmount",
  });

  const watchedSubtotal = useWatch({
    control: form.control,
    name: "subtotal",
  });

  const watchedDiscount = useWatch({
    control: form.control,
    name: "discount",
  });

  const handleQuantityChange = (quantity: number) => {
    form.setValue("quantity", quantity);
    const { subtotal, discountAmount } = calculateDiscountAmount(
      form.getValues("unitPrice"),
      form.getValues("quantity"),
      form.getValues("discount") ? form.getValues("discount") : undefined
    );

    form.setValue("subtotal", subtotal);
    form.setValue("discountAmount", discountAmount);

    updateTotal();
  };

  const calculateDiscountAmount = (
    unitPrice: number,
    quantity: number,
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

  const updateTotal = () => {
    let tmp = watchedSubtotal;
    if (watchedDiscountAmount) {
      tmp = watchedSubtotal - watchedDiscountAmount;
    }

    setTotal(tmp >= 0 ? tmp : 0);
  };

  const handleRemoveDiscount = () => {
    form.setValue("discount", undefined);
    const { subtotal, discountAmount } = calculateDiscountAmount(
      form.getValues("unitPrice"),
      form.getValues("quantity"),
      undefined
    );
    form.setValue("subtotal", subtotal);
    form.setValue("discountAmount", discountAmount);
    updateTotal();
  };

  useEffect(() => {
    updateTotal();
  }, [watchedDiscountAmount]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 overflow-y-auto"
        >
          {form.getValues("itemableId") ? (
            <Card className="border-none shadow-none w-full p-0">
              <CardHeader>
                <CardTitle>
                  {form.getValues("itemableType")} - {form.getValues("name")}
                </CardTitle>
                <CardDescription>
                  {form.getValues("description")}
                </CardDescription>
                <CardAction>
                  <Button
                    variant={"link"}
                    type="button"
                    onClick={() => setIsShowAddItem(true)}
                  >
                    <Edit></Edit>
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent className="flex justify-between">
                <span>Quantity: </span>
                <Input
                  type="number"
                  min={1}
                  className="w-20 inline-block"
                  {...form.register(`quantity`, {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const quantity = e.target.valueAsNumber;
                      handleQuantityChange(quantity);
                    },
                  })}
                />
              </CardContent>

              <CardContent className="flex justify-between">
                <span>Unit Price</span>
                <span>{form.getValues("unitPrice")}</span>{" "}
              </CardContent>

              <CardContent className="flex justify-between border-t-2 pt-2">
                <span>Subtotal:</span>
                <span>{watchedSubtotal}</span>
              </CardContent>

              <CardContent className="flex flex-col border-t-2 pt-2">
                {watchedDiscount ? (
                  <>
                    <div className="flex justify-between">
                      <span>Discount Code:</span>
                      <span>{watchedDiscount?.code}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Discount Amount:</span>
                      <span>{watchedDiscountAmount}</span>
                    </div>

                    <div className="text-right text-xl">
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleRemoveDiscount}
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
                      setIsShowAddDiscount(true);
                    }}
                    className="p-0 text-xl"
                  >
                    Add Discount?
                  </Button>
                )}
              </CardContent>

              <CardContent className="flex justify-between border-t-2 pt-2">
                <h1 className="font-bold">Total: </h1>
                <span>{total}</span>
              </CardContent>
            </Card>
          ) : (
            <Button
              type="button"
              onClick={() => setIsShowAddItem(true)}
              className="w-full"
            >
              Add new Item
            </Button>
          )}

          {/* Doneeeeeeeeeeeeeeee */}
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
                  isService={isService}
                  handleAddProduct={handleAddProduct}
                  handleAddService={handleAddService}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isShowAddDiscount}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setIsShowAddDiscount(false);
              }
            }}
          >
            <DialogContent>
              <DialogTitle></DialogTitle>
              <AddDiscount handleAddDiscount={handleAddDiscount} />
            </DialogContent>
          </Dialog>

          {form.getValues("itemableId") ? (
            <Button type="submit" className="w-full">
              Add
            </Button>
          ) : (
            ""
          )}
        </form>
      </Form>
    </>
  );
};

export default AddItemForm;
