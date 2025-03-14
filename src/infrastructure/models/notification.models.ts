import mongoose, { Schema, Document } from "mongoose";
export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId;
  role: "user" | "doctor" | "admin";
  type: "doctor_registration" | "general" | "chat" | "appointment" | "payment";
  message: string;
  status?: "pending" | "approved" | "rejected";
  metadata?: Record<string, any>;
  read?: boolean;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: false },
    role: { type: String, enum: ["user", "doctor", "admin"], required: true },
    type: { type: String, enum: ["doctor_registration", "general", "chat", "appointment", "payment"], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // TODO not needed clear this
    metadata: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationModel;
