import mongoose from "mongoose";
import { NotificationType, OtpCodeTypes, VerificationCodeTypes } from "../constants/verficationCodeTypes";
import { generateOtpExpiration } from "./date";
import { generateOTP } from "./otpGenerator";
import { Otp } from "../../domain/entities/Otp";
import Role from "../constants/UserRole";
import { Session } from "../../domain/entities/Session";
import { Notification } from "../../domain/entities/Notification";

//create OTP
export const IcreateOtp = (userId: mongoose.Types.ObjectId, type: OtpCodeTypes) => {
  return new Otp(new mongoose.Types.ObjectId(), userId, generateOTP(), type, generateOtpExpiration());
};

//Session
export function IcreateSession(
  userId: mongoose.Types.ObjectId,
  role: Role,
  userAgent: string | undefined,
  expiresAt: Date
) {
  return new Session(new mongoose.Types.ObjectId(), userId, role, expiresAt, new Date(), userAgent);
}

export const ERRORS = {
  EMAIL_VERIFICATION_REQUIRED: "Please verify your email. A verification code has been sent to your email.",
};

export const INotification = (
  userId: mongoose.Types.ObjectId,
  type: NotificationType,
  message: string,
  status: "pending" | "approved" | "rejected",
  metadata?: Record<string, any>,
  read?: boolean
) => {
  return new Notification(userId, type, message, status, metadata, read);
};
