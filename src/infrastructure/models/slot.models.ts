import mongoose, { Document, Model, Schema } from "mongoose";


export interface SlotDocument extends Document {
    _id: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    date: Date;
    consultationType : "video" | "audio" | "chat",
    status : "available" | "booked" | "cancelled"
    patientId?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const SlotSchema = new Schema<SlotDocument>({
    doctorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["available", "booked", "cancelled"], default: "available" },
    consultationType: { type: String, enum: ["video", "audio" , "chat"], default: "video" },
    patientId: { type: mongoose.Schema.Types.ObjectId, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


export const SlotModel : Model<SlotDocument> = mongoose.model<SlotDocument>("Slot", SlotSchema);