import { Service } from "typedi";
import { IAdminRepository, IAdminRepositoryToken } from "../../application/repositories/IAdminRepository";
import { Admin } from "../../domain/entities/Admin";
import { AdminModel } from "../models/adminModel";
import { UserModel } from "../models/UserModel";
import { User } from "../../domain/entities/User";
import { Doctor } from "../../domain/entities/Doctors";
import { DoctorModel } from "../models/doctor.model";
import mongoose from "mongoose";


@Service(IAdminRepositoryToken )
export class AdminRepository implements IAdminRepository{

    async findAdminByEmail(email: string): Promise<Admin | null> {
        const admin  = await AdminModel.findOne({ email });
        return admin
    }

    async getAllUsers(): Promise<any> {
        const users = await UserModel.find({});
        return users
        
    }

    async getAllDoctors(): Promise<any> {
        const doctors = await DoctorModel.find().select('-password'); 
        return doctors;
    }

    async approveRequest(id: mongoose.Types.ObjectId): Promise<void> {
        await DoctorModel.findByIdAndUpdate(id, { $set: { isApproved: true } }, { new: true });
    }
    
    async rejectRequest(id: mongoose.Types.ObjectId): Promise<void> {
        await DoctorModel.findByIdAndUpdate(id, { $set: { isApproved: false } }, { new: true });
    }
    
    
}