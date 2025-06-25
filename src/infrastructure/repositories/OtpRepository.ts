import mongoose, { Types } from "mongoose";
import { IOptverificationRepository, IOtpReposirtoryCodeToken } from "../../application/repositories/IOtpReposirtory";
import { Otp } from "../../domain/entities/Otp";
import OtpVerificationModel from "../models/otp.models";
import { Service } from "typedi";

@Service(IOtpReposirtoryCodeToken)
export class OtpRepository implements IOptverificationRepository {
  async saveOtp(otp: Otp): Promise<Otp> {
    const result = await OtpVerificationModel.create(otp);
    return result as Otp;
  }
  async findOtpById(code: string, userId: Types.ObjectId, type: string): Promise<Otp | null> {

    const otpEntry = await OtpVerificationModel.findOne({
      code: code,
      userId: userId,
      type: type,
      expiresAt: { $gt: new Date() },
    });

    return otpEntry as Otp;
  }

  // delete after verification
  async deleteOtp(id: mongoose.Types.ObjectId): Promise<void> {
    await OtpVerificationModel.deleteOne({ _id: id });
  }
  async deleteOtpByUserId(userId: mongoose.Types.ObjectId): Promise<void> {
    await OtpVerificationModel.deleteMany({ userId });
  }
  // count documents in collection
  async countVerificationCodes(id: mongoose.Types.ObjectId, type: string, time: Date): Promise<number> {
    const result = await OtpVerificationModel.countDocuments({
      userId: id,
      type: type,
      createdAt: { $gt: time },
    });
    return result;
  }
}
