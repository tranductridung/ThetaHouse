import { z } from "zod";
import { COURSE_MODE, ENROLLMENT_STATUS } from "../constants/constants";
import { itemSchema } from "./item.schema";

export const baseEnrollmentSchema = z.object({
  course: z.object({
    name: z.string(),
    mode: z.enum(COURSE_MODE),
    startDate: z.date(),
  }),
  student: z.object({
    id: z.number(),
    fullName: z.string(),
  }),
  item: itemSchema,
  note: z.string().optional().nullable(),
});

export const enrollmentSchema = baseEnrollmentSchema.extend({
  id: z.number(),
  status: z.enum(ENROLLMENT_STATUS),
});

export const editEnrollmentFormSchema = z.object({
  id: z.number(),
  note: z.string().nullable().optional(),
  student: z
    .object({
      id: z.number(),
      fullName: z.string(),
    })
    .nullable()
    .optional(),
});

export type EnrollmentType = z.infer<typeof enrollmentSchema>;
export type EditEnrollmentFormType = z.infer<typeof editEnrollmentFormSchema>;
