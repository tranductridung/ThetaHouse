import { z } from "zod";
import { CommonStatus, CourseMode, CourseRole } from "../constants/constants";

export const baseCourseSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  meetingLink: z.string().optional(),
  meetingPassword: z.string().optional(),
  offlineSession: z.number().nullable().optional(),
  onlineSession: z.number().nullable().optional(),
  price: z.number(),
  mode: z.enum(CourseMode),
  startDate: z.date(),
  maxStudent: z.number(),
});

export const courseSchema = baseCourseSchema.extend({
  id: z.number(),
  status: z.enum(CommonStatus),
});

export const courseFormSchema = baseCourseSchema
  .extend({})
  .superRefine((data, ctx) => {
    if (data.mode !== "Online") {
      const value = data.offlineSession;
      if (typeof value !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required!",
          path: ["offlineSession"],
        });
      }

      if (value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Session and must be > 0",
          path: ["offlineSession"],
        });
      }
    }

    if (data.mode !== "Offline") {
      const value = data.onlineSession;
      if (typeof value !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required!",
          path: ["onlineSession"],
        });
      }

      if (value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Session and must be > 0",
          path: ["onlineSession"],
        });
      }
    }
  });

export const courseStaffSchema = z.object({
  staff: z.object({ id: z.number(), fullName: z.string() }),
  role: z.enum(CourseRole),
  course: z.object({
    id: z.number(),
    name: z.string(),
    mode: z.enum(CourseMode),
    startDate: z.date(),
  }),
});

export type CourseType = z.infer<typeof courseSchema>;
export type CourseStaffType = z.infer<typeof courseStaffSchema>;
export type CourseFormType = z.infer<typeof courseFormSchema>;
