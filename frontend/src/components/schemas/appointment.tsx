import { z } from "zod";
import { TypeOfAppointment, TypeOfPartner } from "../constants/constants";
import { moduleSchema } from "./module";
import { description } from "../chart-area-interactive";

export const baseAppointmentSchema = z.object({});

export const appointmentSchema = baseAppointmentSchema.extend({
  id: z.number(),
  customer: z.object({
    fullName: z.string(),
  }),
  item: z.object({ id: z.number() }),
  type: z.enum(TypeOfAppointment),
  startAt: z.date(),
  room: z.object({ name: z.string() }),
  healer: z.object({
    fullName: z.string(),
  }),
  duration: z.number(),
  modules: z.array(
    z.object({
      name: z.string(),
    })
  ),
});

export const createAppointmentSchema = baseAppointmentSchema.extend({
  itemId: z.number(),
  note: z.string().optional(),
  customerId: z.number(),
  type: z.enum(TypeOfAppointment),
  startAt: z.date().optional(),
  roomId: z.number().optional(),
  healerId: z.number().optional(),
  duration: z.number().optional(),
  moduleIds: z.array(z.number()).optional(),
});
export const editAppointmentSchema = baseAppointmentSchema.extend({
  note: z.string().optional(),
  customerId: z.number(),
  startAt: z.date().optional(),
  roomId: z.number().optional(),
  healerId: z.number().optional(),
  duration: z.number().optional(),
  moduleIds: z.array(z.number()).optional(),
});

export const appointmentDraftSchema = z.object({
  note: z.string().optional(),
  customer: z.object({
    id: z.number(),
    type: z.enum(TypeOfPartner),
    fullName: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
  }),
  healer: z
    .object({
      id: z.number(),
      fullName: z.string(),
      email: z.string(),
      phoneNumber: z.string(),
    })
    .optional(),
  room: z.object({ name: z.string(), description: z.string() }),

  id: z.number(),
  startAt: z.date().optional(),
  duration: z.number().optional(),
  modules: z.array(moduleSchema).optional(),
  type: z.enum(TypeOfAppointment),
});

export type AppointmentType = z.infer<typeof appointmentSchema>;
export type CreateAppointmentType = z.infer<typeof createAppointmentSchema>;
export type AppointmentDraftType = z.infer<typeof appointmentDraftSchema>;
