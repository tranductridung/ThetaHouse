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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AppointmentType,
  type AppointmentDraftType,
  appointmentDraftSchema,
} from "../schemas/appointment.schema";
import { format } from "date-fns";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserComboBox } from "../comboBoxs/user.comboBox";
import { RoomComboBox } from "../comboBoxs/room.comboBox";
import { MultiModuleComboBox } from "../comboBoxs/module.comboBox";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";

type AppointmentProps = {
  type: "add" | "edit" | "addFree" | "consultation" | "editConsultation";
  onSubmit: (formData: AppointmentDraftType) => void;
  appointmentData: AppointmentType | null;
  setIsSelectOpen: (isOpen: boolean) => void;
};

const AppointmentForm = ({
  onSubmit,
  appointmentData,
  type,
  setIsSelectOpen,
}: AppointmentProps) => {
  const form = useForm<AppointmentDraftType>({
    resolver: zodResolver(appointmentDraftSchema),
    defaultValues: {
      category:
        appointmentData?.category ??
        (type === "consultation" || type === "editConsultation"
          ? "Consultation"
          : "Therapy"),
      note: appointmentData?.note ?? "",
      healer: appointmentData?.healer ?? undefined,
      duration: appointmentData?.duration,
      startAt: appointmentData?.startAt
        ? new Date(appointmentData.startAt)
        : undefined,

      room: appointmentData?.room ?? undefined,
      type: appointmentData?.type ?? (type === "addFree" ? "Free" : "Main"),
      modules: appointmentData?.modules ?? [],
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
            <h1 className="text-2xl font-bold">
              {type === "edit" ? "Edit Appointment" : "Create Appointment"}
            </h1>
          </div>
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
          {/* Start At */}
          <FormField
            control={form.control}
            name="startAt"
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
          {/* Type */}
          {type !== "consultation" && (
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-1/2 flex-col w-full">
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    onOpenChange={setIsSelectOpen}
                    value={field.value}
                    disabled={type !== "add"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a type of appointment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="w-full">
                        <SelectItem value="Main">Main</SelectItem>
                        <SelectItem value="Bonus">Bonus</SelectItem>
                        <SelectItem disabled={true} value="Free">
                          Free
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {/* Duration */}
          {type !== "add" && (
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="flex flex-1/2 flex-col w-full">
                  <FormLabel>Duration</FormLabel>
                  <Input
                    type="number"
                    step={"any"}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {/* Healer */}
          <FormField
            control={form.control}
            name="healer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Healer</FormLabel>
                <FormControl>
                  <UserComboBox
                    value={field.value}
                    onChange={(user) => field.onChange(user)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {type !== "consultation" && (
            <>
              {/* Room */}
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <FormControl className="font-normal">
                      <RoomComboBox
                        value={field.value}
                        onChange={(room) =>
                          field.onChange(room ? room : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Modules */}
              <FormField
                control={form.control}
                name="modules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <FormControl>
                      <MultiModuleComboBox
                        selectedModules={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <Button type="submit" className="w-full">
            {type === "edit" ? "Save" : "Create"}
          </Button>
        </form>
      </Form>
    </>
  );
};
export default AppointmentForm;
