"use client";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import {
  editEnrollmentFormSchema,
  type EditEnrollmentFormType,
  type EnrollmentType,
} from "../schemas/enrollment.schema";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { PartnerComboBox } from "../comboBoxs/partner.comboBox";

type EnrollmentProps = {
  onSubmit: (formData: EditEnrollmentFormType) => void;
  enrollmentData: EnrollmentType | null;
};

const EnrollmentForm = ({ onSubmit, enrollmentData }: EnrollmentProps) => {
  console.log("enrollmentData", enrollmentData);
  const form = useForm<EditEnrollmentFormType>({
    resolver: zodResolver(editEnrollmentFormSchema),
    defaultValues: {
      id: enrollmentData?.id,
      note: enrollmentData?.note ?? "",
      student: enrollmentData?.student || null,
    },
  });

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 overflow-y-auto "
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Edit Enrollment</h1>
          </div>

          {/* Note */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Note"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Student */}
          <FormField
            control={form.control}
            name="student"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <FormControl>
                  <PartnerComboBox
                    value={field?.value}
                    onChange={(partner) => field.onChange(partner)}
                    type="Customer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </Form>
    </>
  );
};
export default EnrollmentForm;
