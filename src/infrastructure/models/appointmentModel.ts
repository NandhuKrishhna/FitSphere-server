import mongoose, { Document, Model, Schema } from "mongoose";

export interface AppointmentDocument extends Document {
    _id: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId; 
    patientId: mongoose.Types.ObjectId; 
    slotId: mongoose.Types.ObjectId; 
    consultationType: "video" | "audio" | "chat"; 
    date: Date; 
    paymentStatus: "pending" | "completed" | "failed"; 
    paymentId?: string; 
    orderId?: string; 
    amount: number; 
    status: "scheduled" | "completed" | "cancelled";
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
    orderId: { type: String, required: false },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const AppointmentModel: Model<AppointmentDocument> = mongoose.model<AppointmentDocument>("Appointment", AppointmentSchema);
