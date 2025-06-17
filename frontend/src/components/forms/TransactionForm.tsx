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
  createTransactionSchema,
  type CreateTransactionType,
} from "../schemas/transaction";

type TransactionProps = {
  onSubmit: (formData: CreateTransactionType) => void;
};

const TransactionForm = ({ onSubmit }: TransactionProps) => {
  const form = useForm<CreateTransactionType>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "Income",
      totalAmount: 0,
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
          {/* Total Amount */}
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem className="flex flex-col md:flex-1/2">
                <FormLabel>Total Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...form.register(`totalAmount`, {
                      valueAsNumber: true,
                    })}
                    className="w-full inline-block"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="flex flex-col md:flex-1/2">
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="w-full">
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Create Transaction
        </Button>
      </form>
    </Form>
  );
};

export default TransactionForm;
