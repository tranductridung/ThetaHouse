"use client";

import {
  Select,
  SelectItem,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "../ui/select";
import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  type CourseType,
  courseStaffSchema,
  type CourseStaffType,
} from "../schemas/course.schema";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserComboBox } from "../comboBoxs/user.comboBox";
import { CourseComboBox } from "../comboBoxs/course.comboBox";

type CourseStaffProps = {
  currentCourse?: CourseType;
  onSubmit: (formData: CourseStaffType) => void;
};

const CourseStaffForm = ({ onSubmit, currentCourse }: CourseStaffProps) => {
  const form = useForm<CourseStaffType>({
    resolver: zodResolver(courseStaffSchema),
    defaultValues: {
      role: "Trainer",
      course: currentCourse ?? undefined,
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Add staff for Course</h1>
          </div>
          
          {/* Course */}
          <FormField
            control={form.control}
            name="course"
            disabled={!!currentCourse}
            render={({ field }) => (
              <FormItem className="w-full md:flex-1">
                <FormLabel>Course</FormLabel>
                <div
                  className={`relative ${currentCourse ? "opacity-50" : ""}`}
                >
                  <CourseComboBox
                    value={field.value}
                    onChange={(course) => {
                      if (!currentCourse) field.onChange(course);
                    }}
                  />
                  {currentCourse && (
                    <div className="absolute inset-0 bg-transparent cursor-not-allowed" />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Staff */}
          <FormField
            control={form.control}
            name="staff"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Staff</FormLabel>
                <FormControl>
                  <UserComboBox
                    value={field.value}
                    onChange={(staff) => field.onChange(staff)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="w-full md:flex-1">
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role of staff in course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="w-full">
                      <SelectItem value="Coach">Coach</SelectItem>
                      <SelectItem value="Trainer">Trainer</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Add
          </Button>
        </form>
      </Form>
    </>
  );
};
export default CourseStaffForm;
