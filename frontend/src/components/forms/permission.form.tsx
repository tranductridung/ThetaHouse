"use client";

import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  type PermissionType,
  permissionFormSchema,
  type PermissionFormType,
} from "../schemas/permission.schema";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";

type PermissionProps = {
  type: "add" | "edit";
  onSubmit: (formData: PermissionFormType) => void;
  permissionData: PermissionType | null;
};

const PermissionForm = ({
  onSubmit,
  type,
  permissionData,
}: PermissionProps) => {
  const form = useForm<PermissionFormType>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      action: permissionData?.action ?? "",
      resource: permissionData?.resource ?? "",
      description: permissionData?.description ?? "",
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">
              {type === "add" ? "Create Permission" : "Edit Permission"}
            </h1>
          </div>

          {/* Resource */}
          <FormField
            control={form.control}
            name="resource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Resource of permission"
                    {...field}
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
              <FormItem>
                <FormLabel>Action</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Action of permission"
                    {...field}
                  />
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
                    placeholder="Description of permission"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {type === "add" ? "Create" : "Save"}
          </Button>
        </form>
      </Form>
    </>
  );
};
export default PermissionForm;
