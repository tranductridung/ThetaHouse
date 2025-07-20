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
  courseFormSchema,
  type CourseFormType,
  type CourseType,
} from "../schemas/course.schema";
import { useForm, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

type CourseProps = {
  type: "add" | "edit";
  onSubmit: (formData: CourseFormType) => void;
  courseData: CourseType | null;
};

const CourseForm = ({ onSubmit, type, courseData }: CourseProps) => {
  const form = useForm<CourseFormType>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: courseData?.name,
      description: courseData?.description,
      offlineSession: courseData?.offlineSession,
      onlineSession: courseData?.onlineSession,
      price: courseData?.price,
      mode: courseData?.mode ?? "Combine",
      startDate: courseData?.startDate
        ? new Date(courseData.startDate)
        : undefined,
      maxStudent: courseData?.maxStudent,
    },
  });

  const watchedMode = useWatch({
    control: form.control,
    name: "mode",
  });
  console.log("form", courseData);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (data) => {
              onSubmit(data);
            },
            (error) => {
              console.log(error);
            }
          )}
          className="space-y-6"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">
              {type === "add" ? "Create Course" : "Edit Course"}
            </h1>
          </div>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Course name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Description of course"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Mode */}
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem className="w-full md:flex-1">
                <FormLabel>Mode</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type of appointment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="w-full">
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Offline">Offline</SelectItem>
                      <SelectItem value="Combine">Combine</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Session */}
          <div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-5">
            {/* Offline Session */}
            {watchedMode !== "Online" && (
              <FormField
                control={form.control}
                name="offlineSession"
                render={({ field }) => (
                  <FormItem className="w-full md:flex-1">
                    <FormLabel>Offline Session</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            )}
            {/* Online Session */}
            {watchedMode !== "Offline" && (
              <FormField
                control={form.control}
                name="onlineSession"
                render={({ field }) => (
                  <FormItem className="w-full md:flex-1">
                    <FormLabel>Online Session</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            )}
          </div>

          <div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-5">
            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full md:flex-1">
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            {/* Max Student */}
            <FormField
              control={form.control}
              name="maxStudent"
              render={({ field }) => (
                <FormItem className="w-full md:flex-1">
                  <FormLabel>Max Student</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>

          {/* Start Date */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => {
              const date =
                field.value instanceof Date ? field.value : undefined;
              const timeString = date ? format(date, "HH:mm:ss") : "";

              return (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      {/* Calendar */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[200px] justify-start"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) => {
                              if (!selectedDate) return;
                              const [h, m, s] = timeString
                                .split(":")
                                .map(Number);
                              const combined = new Date(selectedDate);
                              combined.setHours(h || 0, m || 0, s || 0, 0);
                              field.onChange(combined);
                            }}
                          />
                        </PopoverContent>
                      </Popover>

                      {/* Time input */}
                      <Input
                        type="time"
                        step="1"
                        value={timeString}
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        onChange={(e) => {
                          const [h, m, s] = e.target.value
                            .split(":")
                            .map(Number);
                          if (date) {
                            const combined = new Date(date);
                            combined.setHours(h || 0, m || 0, s || 0, 0);
                            field.onChange(combined);
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button type="submit" className="w-full">
            {type === "add" ? "Create" : "Save"}
          </Button>
        </form>
      </Form>
    </>
  );
};
export default CourseForm;
