import mongoose from "mongoose";
export class Slot {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public doctorId: mongoose.Types.ObjectId,
    public startTime: Date,
    public endTime: Date,
    public date: Date,
    public consultationType: "video" | "audio" | "chat" = "video",
    public status: "available" | "booked" | "cancelled" | "completed" | "expired" = "available", // Added 'completed' & 'expired'
    public patientId?: mongoose.Types.ObjectId,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
