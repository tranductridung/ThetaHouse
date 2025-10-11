import { z } from "zod";

import { moduleSchema } from "./module.schema";
import {
  APPOINTMENT_CATEGORY,
  APPOINTMENT_STATUS,
  APPOINTMENT_TYPE,
} from "../constants/constants";

export const baseAppointmentSchema = z.object({});
export const appointmentSchema = baseAppointmentSchema.extend({
  id: z.number(),
  customer: z.object({
    id: z.number(),
    fullName: z.string(),
  }),
  item: z.object({ id: z.number() }),
  type: z.enum(APPOINTMENT_TYPE),
  category: z.enum(APPOINTMENT_CATEGORY),
  startAt: z.date(),
  endAt: z.date(),
  room: z.object({
    id: z.number(),
    name: z.string(),
  }),
  healer: z.object({
    id: z.number(),
    fullName: z.string(),
  }),
  duration: z.number(),
  modules: z.array(
    z.object({
      name: z.string(),
    })
  ),
  note: z.string(),
  status: z.enum(APPOINTMENT_STATUS),
});

export const editAppointmentSchema = baseAppointmentSchema.extend({
  note: z.string().optional(),
  type: z.enum(APPOINTMENT_TYPE),
  startAt: z.date().optional(),
  roomId: z.number().optional(),
  healerId: z.number().optional(),
  moduleIds: z.array(z.number()).optional(),
});

export const createAppointmentSchema = editAppointmentSchema.extend({
  customerId: z.number().optional(),
});

export const appointmentDraftSchema = z
  .object({
    note: z.string().optional(),
    healer: z
      .object({
        id: z.number(),
        fullName: z.string(),
      })
      .optional(),
    room: z.object({ name: z.string(), id: z.number() }).optional(),
    startAt: z.date().optional(),
    modules: z.array(moduleSchema).optional(),
    type: z.enum(APPOINTMENT_TYPE),
    category: z.enum(APPOINTMENT_CATEGORY),
    duration: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "Consultation") {
      if (data.duration === undefined || isNaN(data.duration)) {
        ctx.addIssue({
          path: ["duration"],
          code: z.ZodIssueCode.custom,
          message: "Required!",
        });
      }

      if (data.healer === undefined) {
        ctx.addIssue({
          path: ["healer"],
          code: z.ZodIssueCode.custom,
          message: "Required!",
        });
      }

      if (data.startAt === undefined) {
        ctx.addIssue({
          path: ["startAt"],
          code: z.ZodIssueCode.custom,
          message: "Required!",
        });
      }
    } else {
      if (
        data.type === "Free" &&
        (data.duration === undefined || isNaN(data.duration))
      ) {
        ctx.addIssue({
          path: ["duration"],
          code: z.ZodIssueCode.custom,
          message: "Required!",
        });
      }
    }
  });

export const consultationAppointmentDraftSchema = z.object({
  note: z.string().optional(),
  healer: z.object({
    id: z.number(),
    fullName: z.string(),
  }),
  startAt: z.date().optional(),
  duration: z.number().optional(),
});

export type AppointmentType = z.infer<typeof appointmentSchema>;
export type CreateAppointmentType = z.infer<typeof createAppointmentSchema>;
export type EditAppointmentType = z.infer<typeof editAppointmentSchema>;
export type AppointmentDraftType = z.infer<typeof appointmentDraftSchema>;
export type ConsultationAppointmentDraftType = z.infer<
  typeof consultationAppointmentDraftSchema
>;
