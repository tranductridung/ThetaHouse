"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { addPayerSchema, type AddPayerType } from "../schemas/add-payer.schema";
import { UserComboBox } from "../comboBoxs/user.comboBox";

type AddPayerProps = {
  onSubmit: (formData: AddPayerType) => void;
};

export default function AddPayerForm({ onSubmit }: AddPayerProps) {
  const form = useForm<AddPayerType>({
    resolver: zodResolver(addPayerSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 text-xl h-full w-full "
      >
        <FormField
          control={form.control}
          name="payer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payer</FormLabel>
              <FormControl>
                <UserComboBox
                  value={field.value}
                  onChange={(partner) => field.onChange(partner)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Cancel
        </Button>
      </form>
    </Form>
  );
}
