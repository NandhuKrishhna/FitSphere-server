import { Token } from "typedi";
import { VerificationCode } from "../../domain/entities/VerificationCode";
import mongoose, { mongo } from "mongoose";

export interface IVerficaitonCodeRepository {
    createVerificationCode(code :VerificationCode): Promise<VerificationCode>;
    findVerificationCode(  code: string, type:string ): Promise<VerificationCode | null>;
    deleteVerificationCode(id: mongoose.Types.ObjectId): Promise<void>;
    countVerificationCodes(id: mongoose.Types.ObjectId, type: string , time: Date): Promise<number>    

}

export const IVerficaitonCodeRepositoryToken = new Token<IVerficaitonCodeRepository>();