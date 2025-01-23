import { Service } from "typedi";
import {
  IVerficaitonCodeRepository,
  IVerficaitonCodeRepositoryToken,
} from "../../application/repositories/IVerificaitonCodeRepository";
import { VerificationCode } from "../../domain/entities/VerificationCode";
import VerificationCodeModel from "../models/verficationCode.model";
import mongoose from "mongoose";

@Service({ id: IVerficaitonCodeRepositoryToken })
export class VerificationCodeRepository implements IVerficaitonCodeRepository {
    
  async createVerificationCode(
    code: VerificationCode
  ): Promise<VerificationCode> {
    const result = await VerificationCodeModel.create(code);
    return result;
  }

  async findVerificationCode(
    code: string,
    type: string
  ): Promise<VerificationCode | null> {
    return VerificationCodeModel.findOne({
      _id: code,
      type: type,
      expiresAt: { $gt: new Date() },
    });
  }

  async deleteVerificationCode(id: mongoose.Types.ObjectId): Promise<void> {
    await VerificationCodeModel.deleteOne();
  }

  async countVerificationCodes(
    id: mongoose.Types.ObjectId,
    type: string,
    time: Date
  ): Promise<number> {
    const result = await VerificationCodeModel.countDocuments({
      userId: id,
      type: type,
      createdAt: { $gt: time },
    });
    return result;
  }
}
