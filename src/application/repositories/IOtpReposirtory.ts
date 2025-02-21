import mongoose from "mongoose";
import { Otp } from "../../domain/entities/Otp";
import { Token } from "typedi";

export interface IOptverificationRepository {
  saveOtp(otp: Otp): Promise<Otp>;
  findOtpById(code: string, user: mongoose.Types.ObjectId, type: string): Promise<Otp | null>;
  deleteOtp(id: mongoose.Types.ObjectId): Promise<void>;
  deleteOtpByUserId(userId: mongoose.Types.ObjectId): Promise<void>;
  countVerificationCodes(userId: mongoose.Types.ObjectId, type: string, time: Date): Promise<number>;
}

export const IOtpReposirtoryCodeToken = new Token<IOptverificationRepository>();
