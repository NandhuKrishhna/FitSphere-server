import mongoose from "mongoose";
import { OtpCodeTypes, VerificationCodeTypes } from "../constants/verficationCodeTypes";
import { generateOtpExpiration } from "./date";
import { generateOTP } from "./otpGenerator";
import { Otp } from "../../domain/entities/Otp";
import UserRoleTypes from "../constants/UserRole";
import { Session } from "../../domain/entities/Session";
import { Wallet } from "../../domain/entities/Wallet";

//create OTP
export const IcreateOtp = (userId: mongoose.Types.ObjectId, type: OtpCodeTypes) => {
  return new Otp(new mongoose.Types.ObjectId(), userId, generateOTP(), type, generateOtpExpiration());
};

//Session
export function IcreateSession(
  userId: mongoose.Types.ObjectId,
  role: UserRoleTypes,
  userAgent: string | undefined,
  expiresAt: Date
) {
  return new Session(new mongoose.Types.ObjectId(), userId, role, expiresAt, new Date(), userAgent);
}

//wallet
export function IcreateWallet(userId: mongoose.Types.ObjectId, currency: string = "INR", balance: number = 0) {
  return new Wallet(new mongoose.Types.ObjectId(), userId, balance, currency);
}

export const ERRORS = {
  EMAIL_VERIFICATION_REQUIRED: "Please verify your email. A verification code has been sent to your email.",
};
