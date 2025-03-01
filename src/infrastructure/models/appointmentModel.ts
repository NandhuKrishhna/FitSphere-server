import mongoose, { Document, Model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
export interface AppointmentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  consultationType: "video" | "audio" | "chat";
  date: Date;
  paymentStatus: "pending" | "completed" | "failed";
  paymentId?: string;
  amount: number;
  status: "scheduled" | "completed" | "cancelled";
  meetingId?: string;
  orderId?: string;
  paymentMethod?: string;
  paymentThrough?: string;
  description?: string;
  bank?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AppointmentSchema = new Schema<AppointmentDocument>({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  consultationType: { type: String, enum: ["video", "audio", "chat"], required: true },
  date: { type: Date, required: true },
  paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  paymentId: { type: String, required: false },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  meetingId: { type: String, default: uuidv4, unique: true },
  orderId: { type: String, required: false },
  paymentMethod: { type: String, required: false },
  paymentThrough: { type: String, required: false },
  description: { type: String, required: false },
  bank: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const AppointmentModel: Model<AppointmentDocument> = mongoose.model<AppointmentDocument>(
  "Appointment",
  AppointmentSchema
);
