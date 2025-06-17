"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "../schemas/appointment";
import { toast } from "sonner";
import { useState } from "react";
import ChooseUser from "../ChooseUser";
import ChooseRoom from "../ChooseRoom";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { UserType } from "../schemas/user";
import type { RoomType } from "../schemas/room";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PartnerType } from "../schemas/partner";
import { Edit, Mail, Phone, User, X } from "lucide-react";
import ChooseCustomerSupplier from "../ChooseCustomerSupplier";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type AppointmentProps = {
  type: "add" | "edit";
  onSubmit: (formData: AppointmentDraftType) => void;
  appointmentData: AppointmentType | null;
};

const AppointmentForm = ({
  onSubmit,
  appointmentData,
  type,
}: AppointmentProps) => {
  const [openCustomerDialog, setOpenCustomerDialog] = useState<boolean>(false);
  const [openHealerDialog, setOpenHealerDialog] = useState<boolean>(false);
  const [openRoomDialog, setOpenRoomDialog] = useState<boolean>(false);

  const form = useForm<AppointmentDraftType>({
    resolver: zodResolver(appointmentDraftSchema),
    defaultValues: {
      id: appointmentData?.id,
      customer: appointmentData?.customer,
      healer: appointmentData?.healer,
      room: appointmentData?.room,
      type: appointmentData?.type,

      startAt: appointmentData?.startAt,
      duration: appointmentData?.duration,
      modules: appointmentData?.modules,
    },
  });

  const handleChooseCustomer = (customer: PartnerType) => {
    form.setValue("customer", customer);
    setOpenCustomerDialog(false);
    toast.success("Choose customer success!");
  };

  const handleChooseHealer = (healer: UserType) => {
    form.setValue("healer", healer);
    setOpenHealerDialog(false);
    toast.success("Choose healer success!");
  };

  const handleChooseRoom = (room: RoomType) => {
    form.setValue("room", room);
    setOpenRoomDialog(false);
    toast.success("Choose room success!");
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">
              {type === "add" ? "Create Appointment" : "Edit Appointment"}
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
                  <Input type="text" placeholder="Note" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration */}
          <CardContent className="flex justify-between">
            <span>Duration: </span>
            <Input
              type="number"
              min={1}
              {...form.register(`duration`, {
                valueAsNumber: true,
                onChange: (e) => {
                  const duration = Number(e.target.value);
                  console.log(duration);
                },
              })}
              className="w-20 inline-block"
            />
          </CardContent>

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
                          <CardTitle className="text-2xl">Customer</CardTitle>
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
                        <CardContent className="flex flex-row space-x-3">
                          <User />
                          <p> {`${form.getValues("customer.fullName")}`}</p>
                        </CardContent>
                        <CardContent className="flex flex-row space-x-3">
                          <Mail />
                          <p> {`${form.getValues("customer.email")}`}</p>
                        </CardContent>
                        <CardContent className="flex flex-row space-x-3">
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

          {/* Healer*/}
          <FormField
            control={form.control}
            name="healer"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Card>
                    {form.getValues("healer") ? (
                      <>
                        <CardHeader>
                          <CardTitle className="text-2xl">Healer</CardTitle>
                          <CardAction>
                            <Button
                              type="button"
                              onClick={() => {
                                setOpenHealerDialog(true);
                              }}
                              className="bg-transparent text-blue-500 hover:bg-blue-100"
                            >
                              <Edit />
                            </Button>

                            <Button
                              type="button"
                              onClick={() => {
                                form.setValue("healer", undefined);
                              }}
                              className="bg-transparent text-red-500 hover:bg-red-100"
                            >
                              <X />
                            </Button>
                          </CardAction>
                        </CardHeader>
                        {form.getValues("healer") ? "" : ""}
                        <CardContent className="flex flex-row space-x-3">
                          <User />
                          <p> {`${form.getValues("healer.fullName")}`}</p>
                        </CardContent>
                        <CardContent className="flex flex-row space-x-3">
                          <Mail />
                          <p> {`${form.getValues("healer.email")}`}</p>
                        </CardContent>
                        <CardContent className="flex flex-row space-x-3">
                          <Phone />
                          <p> {`${form.getValues("healer.phoneNumber")}`}</p>
                        </CardContent>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => {
                          setOpenHealerDialog(true);
                        }}
                      >
                        Add Healer
                      </Button>
                    )}
                  </Card>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room */}
          <FormField
            control={form.control}
            name="room"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Card>
                    {form.getValues("room") ? (
                      <>
                        <CardHeader>
                          <CardTitle className="text-2xl">Room</CardTitle>
                          <CardAction>
                            <Button
                              type="button"
                              onClick={() => {
                                setOpenRoomDialog(true);
                              }}
                              className="bg-transparent text-blue-500 hover:bg-blue-100"
                            >
                              <Edit />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                form.setValue("room", undefined);
                              }}
                              className="bg-transparent text-red-500 hover:bg-red-100"
                            >
                              <X />
                            </Button>
                          </CardAction>
                        </CardHeader>
                        {form.getValues("room") ? "" : ""}
                        <CardContent className="flex flex-row space-x-3">
                          <User />
                          <p> {`${form.getValues("room.name")}`}</p>
                        </CardContent>
                        <CardContent className="flex flex-row space-x-3">
                          <Mail />
                          <p> {`${form.getValues("room.description")}`}</p>
                        </CardContent>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => {
                          setOpenRoomDialog(true);
                        }}
                      >
                        Add Room
                      </Button>
                    )}
                  </Card>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Type */}
          {type === "add" ? (
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a type of appointment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="w-full">
                        <SelectItem value="Main">Main</SelectItem>
                        <SelectItem value="Bonus">Bonus</SelectItem>
                        <SelectItem value="Free">Free</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <h1>Type is: {form.getValues("type")}</h1>
          )}

          {/* Customer Dialog */}
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
              <div className="max-w-[90vw] max-h-[80vh] overflow-y-auto overflow-x-auto">
                <ChooseCustomerSupplier
                  type="Customer"
                  handleChoosePartner={handleChooseCustomer}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Healer Dialog */}
          <Dialog
            open={openHealerDialog}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpenHealerDialog(false);
              }
            }}
          >
            <DialogContent>
              <DialogTitle></DialogTitle>
              <div className="max-w-[90vw] max-h-[80vh] overflow-y-auto overflow-x-auto">
                <ChooseUser handleChooseUser={handleChooseHealer} />
              </div>
            </DialogContent>
          </Dialog>

          {/* Room Dialog */}
          <Dialog
            open={openRoomDialog}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpenRoomDialog(false);
              }
            }}
          >
            <DialogContent>
              <DialogTitle></DialogTitle>
              <div className="max-w-[90vw] max-h-[80vh] overflow-y-auto overflow-x-auto">
                <ChooseRoom handleChooseRoom={handleChooseRoom} />
              </div>
            </DialogContent>
          </Dialog>

          <Button type="submit" className="w-full">
            {type === "add" ? "Create" : "Save"}
          </Button>
        </form>
      </Form>
    </>
  );
};
export default AppointmentForm;
