import { Token } from "typedi";
import { User } from "../../domain/entities/User";
import { Admin } from "../../domain/entities/Admin";
import { Doctor } from "../../domain/entities/Doctors";
import mongoose from "mongoose";
import { LookUpDoctor } from "../../domain/types/doctorTypes";

export interface IAdminRepository {
    findAdminByEmail(email: string): Promise<any>;
    getAllUsers(): Promise<User | null>;
    getAllDoctors(): Promise<Doctor | null>;
    approveRequest(id: mongoose.Types.ObjectId): Promise<void>;
    rejectRequest(id: mongoose.Types.ObjectId): Promise<Doctor | null>;
    doctorDetails() : Promise<LookUpDoctor | null>
    unblockById(id : mongoose.Types.ObjectId): Promise<void>;
    blockById(id : mongoose.Types.ObjectId): Promise<User | null>;
}

export const IAdminRepositoryToken = new Token<IAdminRepository>();