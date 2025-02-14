import mongoose from "mongoose";

export type SlotDocument = {
    _id: mongoose.Types.ObjectId;
    doctorId:  mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    date: Date;
    consultationType: "video" | "audio" | "chat";
    status: "available" | "booked" | "cancelled";
    patientId?:  mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };
  