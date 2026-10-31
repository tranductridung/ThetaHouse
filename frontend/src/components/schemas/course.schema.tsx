import { z } from "zod";
import {
  COMMON_STATUS,
  COURSE_MODE,
  COURSE_ROLE,
} from "../constants/constants";

export const baseCourseSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  meetingLink: z.string().optional(),
  meetingPassword: z.string().optional(),
  offlineSession: z.number().nullable().optional(),
  onlineSession: z.number().nullable().optional(),
  price: z.number(),
  mode: z.enum(COURSE_MODE),
  startDate: z.coerce.date(),
  maxStudent: z.number(),
});

export const courseSchema = baseCourseSchema.extend({
  id: z.number(),
  status: z.enum(COMMON_STATUS),
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

      if (value && value <= 0) {
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

      if (value && value <= 0) {
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
  role: z.enum(COURSE_ROLE),
  course: courseSchema,
  // course: z.object({
  //   id: z.number(),
  //   name: z.string(),
  //   mode: z.enum(COURSE_MODE),
  //   startDate: z.date(),
  // }),
});

export const createCourseStaffSchema = z.object({
  staffId: z.number(),
  role: z.enum(COURSE_ROLE),
  courseId: z.number(),
});

export type CourseType = z.infer<typeof courseSchema>;
export type CourseFormType = z.infer<typeof courseFormSchema>;
export type CreateCourseStaffType = z.infer<typeof createCourseStaffSchema>;
export type CourseStaffType = z.infer<typeof courseStaffSchema>;
