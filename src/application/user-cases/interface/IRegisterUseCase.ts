import { Token } from "typedi";
import { LoginUserParams, RegisterUserParams, ResetPasswordParams } from "../../../domain/types/userTypes";
import { IAdminLoginResponse, IResendVerificationCodeResponse } from "../interface-types/UseCase-types";
import mongoose from "mongoose";
import { UserDocument } from "../../../infrastructure/models/UserModel";
import { AccessTokenPayload } from "../../../shared/utils/jwt";
import { DoctorDocument } from "../../../infrastructure/models/DoctorModel";

export interface IRegisterUseCase {
    registerUser(userData: RegisterUserParams): Promise<IAdminLoginResponse>;
    verifyOtp(code: string, userId: mongoose.Types.ObjectId): Promise<{ user: UserDocument }>;
    loginUser(userData: LoginUserParams): Promise<IAdminLoginResponse>;
    logoutUser(payload: AccessTokenPayload): Promise<void>;
    setRefreshToken(refreshToken: string): Promise<{ accessToken: string, newRefreshToken: string }>;
    verifyEmail(code: string): Promise<{ user: UserDocument }>;
    sendPasswordResetEmail(email: string, role: string): Promise<{ user: UserDocument | DoctorDocument }>;
    verifyResetPassword(userId: mongoose.Types.ObjectId, code: string): Promise<{ user: mongoose.Types.ObjectId }>;
    resetPassword({ userId, role, password }: ResetPasswordParams): Promise<{ user: UserDocument | DoctorDocument }>;
    resendVerificaitonCode(email: string, role: string): Promise<IResendVerificationCodeResponse>;
    googleAuth(code: string): Promise<IAdminLoginResponse>;
};
export const IRegisterUseCaseToken = new Token<IRegisterUseCase>();