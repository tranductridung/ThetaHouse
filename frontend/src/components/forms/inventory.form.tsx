"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  inventoryDraftSchema,
  type InventoryDraftType,
} from "../schemas/inventory.schema";
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
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductComboBox } from "../comboBoxs/product.comboBox";

type InventoryProps = {
  onSubmit: (formData: InventoryDraftType) => void;
};

const InventoryForm = ({ onSubmit }: InventoryProps) => {
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

  const watchedAction = useWatch({
    control: form.control,
    name: "action",
  });

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
        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem className="flex-1/3">
              <FormLabel>Product</FormLabel>
              <FormControl>
                <ProductComboBox
                  value={field.value}
                  onChange={(discount) => field.onChange(discount)}
                />
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
                    type="number"
                    min={1}
                    max={
                      watchedAction === "Adjust-Minus" && watchedProduct
                        ? watchedProduct.quantity
                        : undefined
                    }
                    value={field.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      const number = !val ? null : Number(val);
                      field.onChange(number);
                    }}
                    onBlur={(e) => {
                      let number = Number(e.target.value);
                      if (!number) number = 1;
                      field.onChange(number);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit Price */}
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem className="flex flex-col md:flex-1/2">
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      const number = !val ? null : Number(val);
                      field.onChange(number);
                    }}
                    onBlur={(e) => {
                      let number = Number(e.target.value);
                      if (!number) number = 1;
                      field.onChange(number);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action */}
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
                      <SelectItem
                        disabled={watchedProduct?.quantity <= 0}
                        value="Adjust-Minus"
                      >
                        Adjust Minus
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Create Inventory
        </Button>
      </form>
    </Form>
  );
};

export default InventoryForm;
