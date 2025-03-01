import mongoose from "mongoose";

export class Appointments {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public doctorId: mongoose.Types.ObjectId,
    public patientId: mongoose.Types.ObjectId,
    public slotId: mongoose.Types.ObjectId,
    public consultationType: "video" | "audio" | "chat" = "video",
    public date: Date,
    public paymentStatus: "pending" | "completed" | "failed" = "pending",
    public amount: number,
    public paymentId?: string,
    public status: "scheduled" | "completed" | "cancelled" = "scheduled",
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}

export type Appointment = {
  _id: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  consultationType?: "video" | "audio" | "chat";
  date: Date;
  paymentStatus?: "pending" | "completed" | "failed";
  meetingId?: string;
  amount: number;
  paymentId?: string;
  status?: "scheduled" | "completed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
};
