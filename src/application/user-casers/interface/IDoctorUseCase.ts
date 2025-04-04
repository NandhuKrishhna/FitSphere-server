import { Token } from "typedi";
import { DoctorDetailsParams, DoctorInfoParams, RegisterDoctorParams } from "../../../domain/types/doctorTypes";
import { DoctorDocument } from "../../../infrastructure/models/DoctorModel";
import { IAdminLoginResponse, IDoctorLoginResponse, ILoginDoctorResponse, IRegisterAsDoctorResponse } from "../interface-types/UseCase-types";
import mongoose from "mongoose";
import { LoginUserParams } from "../../../domain/types/userTypes";
import { AccessTokenPayload } from "../../../shared/utils/jwt";
import { DoctorDetailsDocument } from "../../../infrastructure/models/doctor.details.model";
import { updatePasswordParams } from "../../../domain/types/doctorUseCase.types";

export interface IDoctorUseCase {
    registerDoctor(details: RegisterDoctorParams): Promise<{ user: DoctorDocument }>;
    registerAsDoctor({ userId, details, doctorInfo }: {
        userId: mongoose.Types.ObjectId;
        details: DoctorDetailsParams;
        doctorInfo: DoctorInfoParams;
    }): Promise<IRegisterAsDoctorResponse>
    verifyEmail(code: string): Promise<DoctorDocument | null>;
    verifyOtp(code: string, userId: mongoose.Types.ObjectId): Promise<{ user: DoctorDocument }>;
    loginDoctor(doctorData: LoginUserParams): Promise<IDoctorLoginResponse>;
    logoutUser(payload: AccessTokenPayload): Promise<void>;
    updateDoctorDetails(userId: mongoose.Types.ObjectId, details: DoctorDetailsParams): Promise<DoctorDetailsDocument | null>;
    updatePassword({ userId, currentPassword, newPassword, role }: updatePasswordParams): Promise<void>

};
export const IDoctorUseCaseToken = new Token<IDoctorUseCase>();