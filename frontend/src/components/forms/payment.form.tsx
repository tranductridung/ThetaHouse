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
  paymentDraftSchema,
  type PaymentDraftType,
} from "../schemas/payment.schema";

type PaymentProps = {
  onSubmit: (formData: PaymentDraftType) => void;
};

const PaymentForm = ({ onSubmit }: PaymentProps) => {
  const form = useForm<PaymentDraftType>({
    resolver: zodResolver(paymentDraftSchema),
    defaultValues: {
      amount: 0,
      method: "Bank Transfer",
      note: "",
    },
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
        <div className="flex flex-col md:flex-row gap-5">
          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex flex-col md:flex-1/2">
                <FormLabel>Amount</FormLabel>
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

          {/* Method */}
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem className="flex flex-col md:flex-1/2">
                <FormLabel>Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  // defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select method payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="w-full">
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="Momo">Momo</SelectItem>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Create Payment
        </Button>
      </form>
    </Form>
  );
};

export default PaymentForm;
