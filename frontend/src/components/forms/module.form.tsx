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
  createModuleFormSchema,
  editModuleFormSchema,
  type CreateModuleFormType,
  type EditModuleFormType,
  type ModuleType,
} from "../schemas/module.schema";

type ModuleProps = {
  type: "add" | "edit";
  onSubmit: (formData: CreateModuleFormType | EditModuleFormType) => void;
  moduleData: ModuleType | null;
};

const ModuleForm = ({ onSubmit, type, moduleData }: ModuleProps) => {
  const schema = type === "add" ? createModuleFormSchema : editModuleFormSchema;

  const form = useForm<CreateModuleFormType | EditModuleFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: moduleData?.name,
      description: moduleData?.description,
      type: moduleData?.type,
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">
              {type === "add" ? "Create Module" : "Edit Module"}
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
                  <Input type="text" placeholder="Module name" {...field} />
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
                    placeholder="Description of module"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      <SelectValue placeholder="Select a type of module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="w-full">
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Combo">Combo</SelectItem>
                        <SelectItem value="Combo">Both</SelectItem>
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
export default ModuleForm;
