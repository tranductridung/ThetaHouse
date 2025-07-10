"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  createPartnerFormSchema,
  editPartnerFormSchema,
  type CreatePartnerFormType,
  type EditPartnerFormType,
  type PartnerType,
} from "../schemas/partner";
import { useEffect, useState } from "react";
import { Calendar } from "../ui/calendar";
import { ChevronDownIcon } from "lucide-react";

type PartnerProps = {
  type: "add" | "edit";
  onSubmit: (formData: CreatePartnerFormType | EditPartnerFormType) => void;
  partnerData: PartnerType | null;
};

const PartnerForm = ({ onSubmit, type, partnerData }: PartnerProps) => {
  const [open, setOpen] = useState(false);

  const schema =
    type === "add" ? createPartnerFormSchema : editPartnerFormSchema;

  console.log("Edit ", partnerData);
  const form = useForm<CreatePartnerFormType | EditPartnerFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: partnerData?.fullName,
      phoneNumber: partnerData?.phoneNumber,
      address: partnerData?.address,
      note: partnerData?.note,
      email: partnerData?.email,
      type: partnerData?.type,
      sex: partnerData?.sex,
      dob: partnerData?.dob ? new Date(partnerData.dob) : undefined,
    },
  });
  console.log(partnerData);
  useEffect(() => {
    if (type === "edit" && partnerData) {
      form.reset({
        fullName: partnerData?.fullName ?? "",
        phoneNumber: partnerData?.phoneNumber ?? "",
        address: partnerData?.address ?? "",
        note: partnerData?.note ?? "",
        email: partnerData?.email ?? "",
        type: partnerData?.type,
        sex: partnerData?.sex,
        dob: partnerData?.dob ? new Date(partnerData.dob) : undefined,
      });
    }
  }, [partnerData]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">
              {type === "add" ? "Create Partner" : "Edit Partner"}
            </h1>
          </div>

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email*/}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Email"
                    {...field}
                    disabled={type !== "add"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col md:flex-row md:gap-5">
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex md:w-1/2 flex-col w-full">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild className="w-full">
                        <Button
                          variant="outline"
                          id="date"
                          className="w-full justify-between font-normal"
                        >
                          {field.value
                            ? new Date(field.value).toLocaleDateString()
                            : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            field.onChange(date);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem className="flex md:w-1/2 flex-col w-full">
                  <FormLabel>Sex</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sex of partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="w-full">
                        <SelectItem value="Undefined">Undefined</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col md:flex-row md:gap-5">
            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="flex md:w-1/2 flex-col w-full">
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Phone Number" {...field} />
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
                <FormItem className="flex md:w-1/2 flex-col w-full">
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={type !== "add"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a type of partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="w-full">
                        <SelectItem value="Customer">Customer</SelectItem>
                        <SelectItem value="Supplier">Supplier</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address*/}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Note*/}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Note" {...field} />
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
export default PartnerForm;
