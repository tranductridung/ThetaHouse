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
import {
  addPartnerSchema,
  type AddPartnerType,
} from "../schemas/add-partner.schema";
import { PartnerComboBox } from "../comboBoxs/partner.comboBox";

type AddPartnerProps = {
  onSubmit: (formData: AddPartnerType) => void;
};

export default function AddPartnerForm({ onSubmit }: AddPartnerProps) {
  const form = useForm<AddPartnerType>({
    resolver: zodResolver(addPartnerSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (error) => {
          console.log("errorrrrrrrrrrrr", error);
        })}
        className="space-y-4 text-xl h-full w-full "
      >
        <FormField
          control={form.control}
          name="partner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partner</FormLabel>
              <FormControl>
                <PartnerComboBox
                  value={field.value}
                  onChange={(partner) => field.onChange(partner)}
                  type="Customer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Transfer
        </Button>
      </form>
    </Form>
  );
}
