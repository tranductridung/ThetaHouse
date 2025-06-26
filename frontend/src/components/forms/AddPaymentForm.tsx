import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { paymentDraftSchema, type PaymentDraftType } from "../schemas/payment";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PartnerComboBox } from "../ComboBoxs/Partner";

type AddPaymentProps = {
  onSubmit: (paymentDraftType: PaymentDraftType) => void;
};

const AddPaymentForm = ({ onSubmit }: AddPaymentProps) => {
  const form = useForm<PaymentDraftType>({
    resolver: zodResolver(paymentDraftSchema),
    defaultValues: {
      amount: 0,
      note: "",
    },
  });

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 overflow-y-auto"
        >
          {/* Note */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Note" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Customer */}
          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <FormControl>
                  <PartnerComboBox
                    value={field.value}
                    onChange={(customer) => field.onChange(customer)}
                    type="Customer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex md:flex-row flex-col gap-x-5">
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex flex-1/2 flex-col">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="w-full inline-block"
                      {...form.register(`amount`, {
                        valueAsNumber: true,
                        onChange: (e) => {
                          console.log("e", e);
                          console.log("amount", form.getValues("amount"));
                        },
                      })}
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
                <FormItem className="flex flex-1/2 flex-col">
                  <FormLabel>Modules</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a type of module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="w-full">
                        <SelectItem value="Bank Transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="Momo">Momo</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Visa">Visa</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full">
            Add
          </Button>
        </form>
      </Form>
    </>
  );
};

export default AddPaymentForm;
