import { Token } from "typedi";
import { User } from "../../domain/entities/User";
import { Doctor } from "../../domain/entities/Doctors";
import mongoose from "mongoose";
import { LookUpDoctor } from "../../domain/types/doctorTypes";
import { DoctorDocument } from "../../infrastructure/models/DoctorModel";
import { UserDocument } from "../../infrastructure/models/UserModel";
import { PaginatedDoctors, PaginatedUsers } from "../../infrastructure/repositories/AdminRepository";
import { AdminDocument } from "../../infrastructure/models/adminModel";
import { DoctorQueryParams, UserQueryParams } from "../../domain/types/queryParams.types";

export interface IAdminRepository {
    findAdminByEmail(email: string): Promise<AdminDocument | null>;
    getAllUsers(queryParams: UserQueryParams): Promise<PaginatedUsers | null>;
    getAllDoctors(queryParams: DoctorQueryParams): Promise<PaginatedDoctors | null>;
    approveRequest(id: mongoose.Types.ObjectId): Promise<void>;
    rejectRequest(id: mongoose.Types.ObjectId): Promise<DoctorDocument | null>;
    doctorDetails(): Promise<LookUpDoctor | null>
    unblockById(id: mongoose.Types.ObjectId, role: string): Promise<UserDocument | DoctorDocument | null>;
    blockById(id: mongoose.Types.ObjectId, role: string): Promise<UserDocument | DoctorDocument | null>;
}

export const IAdminRepositoryToken = new Token<IAdminRepository>();