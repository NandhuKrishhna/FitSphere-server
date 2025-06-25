import mongoose from "mongoose";
import { NotificationType, OtpCodeTypes, VerificationCodeTypes } from "../constants/verificationCodeTypes";
import { generateOtpExpiration } from "./date";
import { generateOTP } from "./otpGenerator";
import { Otp } from "../../domain/entities/Otp";
import { Session } from "../../domain/entities/Session";

//create OTP
export const IcreateOtp = (userId: mongoose.Types.ObjectId, type: OtpCodeTypes) => {
  return new Otp(new mongoose.Types.ObjectId(), userId, generateOTP(), type, generateOtpExpiration());
};

//Session
export function IcreateSession(
  userId: mongoose.Types.ObjectId,
  role: "user" | "doctor" | "admin",
  userAgent: string | undefined,
  expiresAt: Date
) {
  return new Session(new mongoose.Types.ObjectId(), userId, role, expiresAt, new Date(), userAgent);
}

export const ERRORS = {
  EMAIL_VERIFICATION_REQUIRED: "Please verify your email. A verification code has been sent to your email.",
};

