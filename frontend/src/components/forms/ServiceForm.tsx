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
  createServiceFormSchema,
  editServiceFormSchema,
  type CreateServiceFormType,
  type EditServiceFormType,
  type ServiceType,
} from "../schemas/service";

type ServiceProps = {
  type: "add" | "edit";
  onSubmit: (formData: CreateServiceFormType | EditServiceFormType) => void;
  serviceData: ServiceType | null;
};

const ServiceForm = ({ onSubmit, type, serviceData }: ServiceProps) => {
  const schema =
    type === "add" ? createServiceFormSchema : editServiceFormSchema;

  const form = useForm<CreateServiceFormType | EditServiceFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: serviceData?.name,
      description: serviceData?.description,
      duration: serviceData?.duration,
      unitPrice: serviceData?.unitPrice,
      session: serviceData?.session,
      bonusSession: serviceData?.bonusSession,
      type: serviceData?.type,
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">
              {type === "add" ? "Create Service" : "Edit Service"}
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
                  <Input type="text" placeholder="Service name" {...field} />
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
                    placeholder="Description of service"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-5">
            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="w-full md:flex-1">
                  <FormLabel>Duration</FormLabel>
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

            {/* Unit Price */}
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem className="w-full md:flex-1">
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Price of service"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-5">
            {/* Session */}
            <FormField
              control={form.control}
              name="session"
              render={({ field }) => (
                <FormItem className="w-full md:flex-1">
                  <FormLabel>Session</FormLabel>
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

            {/* Session */}
            <FormField
              control={form.control}
              name="bonusSession"
              render={({ field }) => (
                <FormItem className="w-full md:flex-1">
                  <FormLabel>Bonus Session</FormLabel>
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
          {type === "add" ? (
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
                      <SelectValue placeholder="Select a type of service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="w-full">
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Combo">Combo</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
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
export default ServiceForm;
