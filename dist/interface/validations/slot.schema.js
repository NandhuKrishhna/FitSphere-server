"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotValidationSchema = exports.ConsultationTypeEnum = exports.SlotStatusEnum = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectIdSchema = zod_1.z.string().refine((id) => mongoose_1.default.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId format",
}).transform((id) => new mongoose_1.default.Types.ObjectId(id));
exports.SlotStatusEnum = zod_1.z.enum(["available", "booked", "cancelled"]);
exports.ConsultationTypeEnum = zod_1.z.enum(["video", "audio", "chat"]);
exports.SlotValidationSchema = zod_1.z.object({
    startTime: zod_1.z.coerce.date().refine((date) => date > new Date(), {
        message: "Start time must be in the future",
    }),
    endTime: zod_1.z.coerce.date(),
    date: zod_1.z.coerce.date(),
    status: exports.SlotStatusEnum.default("available"),
    consultationType: exports.ConsultationTypeEnum.default("video"),
    patientId: ObjectIdSchema.optional(),
}).superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "End time must be after start time",
            path: ["endTime"],
        });
    }
});
