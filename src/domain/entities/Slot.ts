import { create } from "domain";
import mongoose from "mongoose";

export class Slot {
    constructor(
        public _id: mongoose.Types.ObjectId,
        public doctorId: mongoose.Types.ObjectId,
        public startTime: Date,
        public endTime: Date,
        public date: Date,
        public consultationType : "video" | "audio" | "chat" = "video",
        public status: "available" | "booked" | "cancelled" = "available",
        public patientId?: mongoose.Types.ObjectId,
        public createdAt?: Date,
        public updatedAt?: Date
    ){}
}