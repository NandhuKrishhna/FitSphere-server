import mongoose, { Types } from "mongoose";
import { IOptverificationRepository, IOtpReposirtoryCodeToken } from "../../application/repositories/IOtpReposirtory";
import { Otp } from "../../domain/entities/Otp";
import OtpVerficationModel from "../models/otp.models";
import { Service } from "typedi";

@Service(IOtpReposirtoryCodeToken)
export class OtpRepository implements IOptverificationRepository {
  async saveOtp(otp: Otp): Promise<Otp> {
    const result = await OtpVerficationModel.create(otp);
    return result as Otp;
  }
  async findOtpById(code: string, userId: Types.ObjectId, type: string): Promise<Otp | null> {
    console.log("Querying OTP with:", { code, userId, type });

    const otpEntry = await OtpVerficationModel.findOne({
      code: code,
      userId: userId,
      type: type,
      expiresAt: { $gt: new Date() },
    });

    console.log("Found OTP entry:", otpEntry);
    return otpEntry as Otp;
  }

  // delete after verification
  async deleteOtp(id: mongoose.Types.ObjectId): Promise<void> {
    await OtpVerficationModel.deleteOne({ _id: id });
  }
  async deleteOtpByUserId(userId: mongoose.Types.ObjectId): Promise<void> {
    await OtpVerficationModel.deleteMany({ userId });
  }
  // count documents in collection
  async countVerificationCodes(id: mongoose.Types.ObjectId, type: string, time: Date): Promise<number> {
    const result = await OtpVerficationModel.countDocuments({
      userId: id,
      type: type,
      createdAt: { $gt: time },
    });
    return result;
  }
}
