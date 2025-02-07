import mongoose from "mongoose";

export type NotificationType = "doctor_registration" | "general";
export type NotificationStatus = "pending" | "approved" | "rejected";

export class Notification {
  constructor(
    public userId: mongoose.Types.ObjectId,
    public type: NotificationType,
    public message: string,
    public status: NotificationStatus = "pending",
    public metadata?: Record<string, any>
  ) {}
}
