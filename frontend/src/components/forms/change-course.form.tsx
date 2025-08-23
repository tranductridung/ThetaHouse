// ChangeCourseForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CourseComboBox } from "../comboBoxs/course.comboBox";

const changeCourseSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),

  course: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export type ChangeCourseFormData = z.infer<typeof changeCourseSchema>;

type ChangeCourseFormProps = {
  onSubmit: (formData: ChangeCourseFormData) => void;
};

const ChangeCourseForm = ({ onSubmit }: ChangeCourseFormProps) => {
  const form = useForm<ChangeCourseFormData>({
    resolver: zodResolver(changeCourseSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Course */}
        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <FormControl>
                <CourseComboBox
                  value={field.value}
                  onChange={(partner) => field.onChange(partner)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
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

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default ChangeCourseForm;
