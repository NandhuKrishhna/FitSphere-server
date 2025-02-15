import { z } from "zod";
import mongoose from "mongoose";
import { userAgentSchema } from "./userSchema";


const ObjectIdSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId format",
  }).transform((id) => new mongoose.Types.ObjectId(id));
  export const SlotStatusEnum = z.enum(["available", "booked", "cancelled"]);
  export const ConsultationTypeEnum = z.enum(["video", "audio", "chat"]);

  export const SlotValidationSchema = z.object({
    startTime: z.coerce.date().refine((date) => date > new Date(), {
      message: "Start time must be in the future",
    }),
    endTime: z.coerce.date(),
    date: z.coerce.date(),
    status: SlotStatusEnum.default("available"),
    consultationType: ConsultationTypeEnum.default("video"),
    patientId: ObjectIdSchema.optional(),
  }).superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
});


export type SlotType = {
    startTime: Date,
    endTime: Date,
    date: Date,
    consultationType : "video" | "audio" | "chat",

}