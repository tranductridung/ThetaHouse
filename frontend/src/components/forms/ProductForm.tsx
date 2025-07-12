"use client";

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
import {
  createProductSchema,
  editProductSchema,
  type CreateProductType,
  type EditProductType,
  type ProductType,
} from "../schemas/product";

type ProductProps = {
  type: "add" | "edit";
  onSubmit: (formData: CreateProductType | EditProductType) => void;
  productData: ProductType | null;
};

const ProductForm = ({ onSubmit, type, productData }: ProductProps) => {
  const schema = type === "add" ? createProductSchema : editProductSchema;

  const form = useForm<CreateProductType | EditProductType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: productData?.name,
      description: productData?.description ?? undefined,
      defaultOrderPrice: productData?.defaultOrderPrice ?? undefined,
      defaultPurchasePrice: productData?.defaultPurchasePrice ?? undefined,
      unit: productData?.unit,

      baseQuantityPerUnit: productData?.baseQuantityPerUnit ?? undefined,
      orderPricePerBaseQuantity:
        productData?.orderPricePerBaseQuantity ?? undefined,
      purchasePricePerBaseQuantity:
        productData?.purchasePricePerBaseQuantity ?? undefined,
      useBaseQuantityPricing: productData?.useBaseQuantityPricing ?? false,
    },
  });

  const watchedUseBaseQuantity = useWatch({
    control: form.control,
    name: "useBaseQuantityPricing",
  });
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">
              {type === "add" ? "Create Product" : "Edit Product"}
            </h1>
          </div>
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Description of product"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-5 md:flex-row md:space-x-5 md:space-y-0">
            {/* Use Base Quantity */}
            <FormField
              control={form.control}
              name="useBaseQuantityPricing"
              render={({ field }) => (
                <FormItem className="w-full md:flex-1/2">
                  <FormLabel>Pricing Method</FormLabel>
                  <FormControl>
                    <Select
                      disabled={type === "edit"}
                      onValueChange={(value) =>
                        field.onChange(value === "baseQuantity")
                      }
                      value={field.value ? "baseQuantity" : "default"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="baseQuantity">
                          Base Quantity
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem className="w-full md:flex-1/2">
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a unit of product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup className="w-full">
                          <SelectItem value="Piece">Piece</SelectItem>
                          <SelectItem value="Kg">Kg</SelectItem>
                          <SelectItem value="Box">Box</SelectItem>
                          <SelectItem value="Liter">Liter</SelectItem>
                          <SelectItem value="Package">Package</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {watchedUseBaseQuantity ? (
            <>
              <FormField
                control={form.control}
                name="baseQuantityPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Quantity Per Unit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={"any"}
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
              <div className="flex flex-col space-y-5 md:flex-row md:space-x-5 md:space-y-0">
                <FormField
                  control={form.control}
                  name="orderPricePerBaseQuantity"
                  render={({ field }) => (
                    <FormItem className="w-full md:flex-1/2">
                      <FormLabel>Order Pricing Base Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={"any"}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchasePricePerBaseQuantity"
                  render={({ field }) => (
                    <FormItem className="w-full md:flex-1/2">
                      <FormLabel>Purchase Pricing Base Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={"any"}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-5 md:flex-row md:space-x-5 md:space-y-0">
              {/* Default Order Price */}
              <FormField
                control={form.control}
                name="defaultOrderPrice"
                render={({ field }) => (
                  <FormItem className="w-full md:flex-1/2">
                    <FormLabel>Default Order Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={"any"}
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

              {/* Default Purchase Price */}
              <FormField
                control={form.control}
                name="defaultPurchasePrice"
                render={({ field }) => (
                  <FormItem className="w-full md:flex-1/2 ">
                    <FormLabel>Default Purchase Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={"any"}
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
            </div>
          )}
          <Button type="submit" className="w-full">
            {type === "add" ? "Create" : "Save"}
          </Button>
        </form>
      </Form>
    </>
  );
};
export default ProductForm;
