"use client";

import { useForm } from "react-hook-form";
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
  createDiscountFormSchema,
  editDiscountFormSchema,
  type CreateDiscountFormType,
  type EditDiscountFormType,
  type DiscountType,
} from "../schemas/discount.schema";

type DiscountProps = {
  type: "add" | "edit";
  onSubmit: (formData: CreateDiscountFormType | EditDiscountFormType) => void;
  discountData: DiscountType | null;
};

const DiscountForm = ({ onSubmit, type, discountData }: DiscountProps) => {
  const schema =
    type === "add" ? createDiscountFormSchema : editDiscountFormSchema;

  const form = useForm<CreateDiscountFormType | EditDiscountFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: discountData?.name,
      description: discountData?.description,
      code: discountData?.code,
      value: discountData?.value,
      type: discountData?.type,
      maxDiscountAmount: discountData?.maxDiscountAmount,
      minTotalValue: discountData?.minTotalValue,
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">
              {type === "add" ? "Create Discount" : "Edit Discount"}
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
                  <Input type="text" placeholder="Discount name" {...field} />
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
                    placeholder="Description of discount"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-5">
            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="w-full md:flex-1">
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Code of discount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Value */}
            {type === "add" ? (
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem className="w-full md:flex-1">
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              ""
            )}
          </div>

          {type === "add" ? (
            <>
              <div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-5">
                {/* Max Discount Amount */}
                <FormField
                  control={form.control}
                  name="maxDiscountAmount"
                  render={({ field }) => (
                    <FormItem className="w-full md:flex-1">
                      <FormLabel>Max Discount Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Min Total Value */}
                <FormField
                  control={form.control}
                  name="minTotalValue"
                  render={({ field }) => (
                    <FormItem className="w-full md:flex-1">
                      <FormLabel>Min Total Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
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

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a type of discount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup className="w-full">
                          <SelectItem value="Percentage">Percentage</SelectItem>
                          <SelectItem value="Fixed">Fixed</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            ""
          )}
          <Button type="submit" className="w-full">
            {type === "add" ? "Create" : "Save"}
          </Button>
        </form>
      </Form>
    </>
  );
};
export default DiscountForm;
