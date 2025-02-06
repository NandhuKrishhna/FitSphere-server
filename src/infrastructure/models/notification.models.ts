import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId; 
  type: "doctor_registration" | "general";
  message: string;
  status: "pending" | "approved" | "rejected";
  metadata?: Record<string, any>; 
  read ?: boolean
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    type: { type: String, enum: ["doctor_registration", "general"], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    metadata: { type: Schema.Types.Mixed }, 
    read : {type : Boolean , default : false}
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationModel;
