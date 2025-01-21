import { Service } from "typedi";
import { IVerficaitonCodeRepository, IVerficaitonCodeRepositoryToken } from "../../application/repositories/IVerificaitonCodeRepository";
import { VerificationCode } from "../../domain/entities/VerificationCode";
import VerificationCodeModel from "../models/verficationCode.model";


@Service({id: IVerficaitonCodeRepositoryToken})
export class VerificationCodeRepository implements IVerficaitonCodeRepository {
    async createVerificationCode(code : VerificationCode) :Promise<void>{
        await VerificationCodeModel.create(code);
    }
   async findVerificationCodeByEmail(email: string): Promise<VerificationCode | null> {
        return VerificationCodeModel.findOne({ email });
   }
}