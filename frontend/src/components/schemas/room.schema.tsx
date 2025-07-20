import { z } from "zod";

export const baseRoomSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const roomFormSchema = baseRoomSchema.extend({});
export const roomSchema = baseRoomSchema.extend({
  id: z.number(),
});

export type RoomType = z.infer<typeof roomSchema>;
export type RoomFormType = z.infer<typeof roomFormSchema>;
