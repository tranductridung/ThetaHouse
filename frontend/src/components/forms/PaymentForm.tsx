"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { paymentDraftSchema, type PaymentDraftType } from "../schemas/payment";
import { toast } from "sonner";
import type { PartnerType } from "../schemas/partner";
import { useEffect, useState } from "react";
import ChooseCustomerSupplier from "../ChooseCustomerSupplier";
import ChooseTransaction from "../ChooseTransaction";
import type { TransactionType } from "../schemas/transaction";
import { Edit, Mail, Phone, User } from "lucide-react";

type PaymentProps = {
  onSubmit: (formData: PaymentDraftType) => void;
};

const PaymentForm = ({ onSubmit }: PaymentProps) => {
  const [openCustomerDialog, setOpenCustomerDialog] = useState<boolean>(false);
  const [openTransactionDialog, setOpenTransactionDialog] =
    useState<boolean>(false);

  const form = useForm<PaymentDraftType>({
    resolver: zodResolver(paymentDraftSchema),
    defaultValues: {
      amount: 0,
      method: "Bank Transfer",
      note: "",
    },
  });

  // const { control, setValue, reset } = form;

  const watchedAmount = useWatch({
    control: form.control,
    name: "amount",
  });

  const watchedTransaction = useWatch({
    control: form.control,
    name: "transaction",
  });

  const handleChooseCustomer = (customer: PartnerType) => {
    form.setValue("customer", customer);
    setOpenCustomerDialog(false);
    toast.success("Choose customer success!");
  };

  const handleChooseTransaction = (transaction: TransactionType) => {
    form.setValue("transaction", transaction);
    setOpenTransactionDialog(false);
    toast.success("Choose transaction success!");
  };

  useEffect(() => {
    if (!watchedTransaction) return;
    const { paidAmount, totalAmount } = watchedTransaction;
    const remainAmount = totalAmount - paidAmount;

    if (remainAmount < watchedAmount)
      toast.warning(
        `Amount is greater than remain amount of transaction ${remainAmount}!`
      );
  }, [watchedAmount, watchedTransaction]);

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
                    type="number"
                    min={0}
                    {...form.register(`amount`, {
                      valueAsNumber: true,
                    })}
                    className="w-full inline-block"
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

        {/* Choose Customer Dialog */}
        <Dialog
          open={openCustomerDialog}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpenCustomerDialog(false);
            }
          }}
        >
          <DialogContent>
            <DialogTitle></DialogTitle>
            <div className="max-w-[90vw] max-h-[80vh] ">
              <ChooseCustomerSupplier
                type={"Customer"}
                handleChoosePartner={handleChooseCustomer}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Choose Customer Dialog */}
        <Dialog
          open={openTransactionDialog}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpenTransactionDialog(false);
            }
          }}
        >
          <DialogContent>
            <DialogTitle></DialogTitle>
            <div className="max-w-[90vw] max-h-[80vh] overflow-y-auto overflow-x-auto">
              <ChooseTransaction
                handleChooseTransaction={handleChooseTransaction}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Customer */}
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Card>
                  {form.getValues("customer") ? (
                    <>
                      <CardHeader>
                        <CardTitle className="text-xl">Customer</CardTitle>
                        <CardAction>
                          <Button
                            type="button"
                            onClick={() => {
                              setOpenCustomerDialog(true);
                            }}
                            className="bg-transparent text-blue-500 hover:bg-blue-100"
                          >
                            <Edit />
                          </Button>
                        </CardAction>
                      </CardHeader>
                      {form.getValues("customer") ? "" : ""}
                      <CardContent className="flex flex-row space-x-1">
                        <User />
                        <p> {`${form.getValues("customer.fullName")}`}</p>
                      </CardContent>
                      <CardContent className="flex flex-row space-x-1">
                        <Mail />
                        <p> {`${form.getValues("customer.email")}`}</p>
                      </CardContent>
                      <CardContent className="flex flex-row space-x-1">
                        <Phone />
                        <p> {`${form.getValues("customer.phoneNumber")}`}</p>
                      </CardContent>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => {
                        setOpenCustomerDialog(true);
                      }}
                    >
                      Add Customer
                    </Button>
                  )}
                </Card>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction */}
        <FormField
          control={form.control}
          name="transaction"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Card>
                  {form.getValues("transaction") ? (
                    <>
                      <CardHeader>
                        <CardTitle className="text-2xl">Transaction</CardTitle>
                        <CardAction>
                          <Button
                            type="button"
                            onClick={() => {
                              setOpenTransactionDialog(true);
                            }}
                            className="bg-transparent text-blue-500 hover:bg-blue-100"
                          >
                            <Edit />
                          </Button>
                        </CardAction>
                      </CardHeader>
                      {form.getValues("transaction") ? "" : ""}
                      <CardContent className="flex flex-row justify-between space-x-1">
                        <span>Source:</span>
                        <p> {`${form.getValues("transaction.sourceType")}`}</p>
                      </CardContent>
                      <CardContent className="flex flex-row justify-between space-x-1">
                        <span>Paid Amount:</span>
                        <p> {`${form.getValues("transaction.paidAmount")}`}</p>
                      </CardContent>
                      <CardContent className="flex flex-row justify-between space-x-1">
                        <span>Total Amount:</span>
                        <p> {`${form.getValues("transaction.totalAmount")}`}</p>
                      </CardContent>
                      <CardContent className="flex flex-row justify-between space-x-1">
                        <span>Status:</span>
                        <p> {`${form.getValues("transaction.status")}`}</p>
                      </CardContent>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => {
                        setOpenTransactionDialog(true);
                      }}
                    >
                      Select Transaction
                    </Button>
                  )}
                </Card>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create Payment
        </Button>
      </form>
    </Form>
  );
};

export default PaymentForm;
