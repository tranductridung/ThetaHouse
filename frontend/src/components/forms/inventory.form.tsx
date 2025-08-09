"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  inventoryDraftSchema,
  type InventoryDraftType,
} from "../schemas/inventory.schema";
import { useState } from "react";
import type { ProductType } from "../schemas/product.schema";
import { toast } from "sonner";
import ChooseProduct from "../ChooseProduct";
import { Edit } from "lucide-react";

type InventoryProps = {
  onSubmit: (formData: InventoryDraftType) => void;
};

const InventoryForm = ({ onSubmit }: InventoryProps) => {
  const [openProductDialog, setOpenProductDialog] = useState<boolean>(false);

  const form = useForm<InventoryDraftType>({
    resolver: zodResolver(inventoryDraftSchema),
    defaultValues: {
      action: "Adjust-Plus",
      quantity: 1,
      note: "",
    },
  });

  const watchedProduct = useWatch({
    control: form.control,
    name: "product",
  });

  const handleChooseProduct = (product: ProductType) => {
    form.setValue("product", product);
    setOpenProductDialog(false);
    toast.success("Choose product success!");
  };

  console.log("Form errors:", form.formState.errors);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" space-y-4 text-xl h-full w-full overflow-y-auto"
      >
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

        <div className="flex flex-col md:flex-row gap-5">
          {/* Quantity */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="flex flex-col md:flex-1/2">
                <FormLabel>Quantity</FormLabel>
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

          {/* Type */}
          <FormField
            control={form.control}
            name="action"
            render={({ field }) => (
              <FormItem className="flex flex-col md:flex-1/2">
                <FormLabel>Action</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a inventory action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="w-full">
                      <SelectItem value="Adjust-Plus">Adjust Plus</SelectItem>
                      <SelectItem value="Adjust-Minus">Adjust Minus</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Choose Product Dialog */}
        <Dialog
          open={openProductDialog}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpenProductDialog(false);
            }
          }}
        >
          <DialogContent>
            <DialogTitle></DialogTitle>
            <div className="max-w-[90vw] max-h-[80vh] ">
              <ChooseProduct handleAddProduct={handleChooseProduct} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Product */}
        <Card>
          {watchedProduct ? (
            <>
              <CardHeader>
                <CardTitle>{watchedProduct?.name ?? ""}</CardTitle>
                <CardDescription>{watchedProduct?.name ?? ""}</CardDescription>
                <CardAction>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setOpenProductDialog(true);
                    }}
                    className="text-xl m-auto"
                  >
                    <Edit />
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent className="flex justify-between">
                <span>Quantity: </span>
                <span>{watchedProduct?.quantity ?? 0}</span>
              </CardContent>

              <CardContent className="flex justify-between">
                <span>Unit: </span>
                <span>{watchedProduct?.unit ?? ""}</span>
              </CardContent>

              <CardContent className="flex justify-between">
                <span>Unit Price: </span>
                <span>{watchedProduct?.unitPrice ?? 0}</span>
              </CardContent>
            </>
          ) : (
            <CardContent>
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setOpenProductDialog(true);
                }}
                className="text-xl m-auto w-full"
              >
                Add Product
              </Button>
            </CardContent>
          )}
        </Card>

        <Button type="submit" className="w-full">
          Create Inventory
        </Button>
      </form>
    </Form>
  );
};

export default InventoryForm;
