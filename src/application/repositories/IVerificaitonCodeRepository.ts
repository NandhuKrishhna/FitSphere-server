import { Token } from "typedi";
import { VerificationCode } from "../../domain/entities/VerificationCode";

export interface IVerficaitonCodeRepository {
    createVerificationCode(code :VerificationCode): Promise<void>;
    findVerificationCodeByEmail(email: string): Promise<VerificationCode | null>;

}

export const IVerficaitonCodeRepositoryToken = new Token<IVerficaitonCodeRepository>();