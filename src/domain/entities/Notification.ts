import mongoose from "mongoose";
import { NotificationType } from "../../shared/constants/verificationCodeTypes";

export type NotificationStatus = "pending" | "approved" | "rejected" | "read";

export class Notification {
  constructor(
    public userId: mongoose.Types.ObjectId,
    public type: NotificationType,
    public message: string,
    public status: NotificationStatus = "pending",
    public metadata?: string,
    public read?: boolean
  ) { }
}
