import { Service } from "typedi";
import { IAdminRepository, IAdminRepositoryToken } from "../../application/repositories/IAdminRepository";
import { Admin } from "../../domain/entities/Admin";
import { AdminDocument, AdminModel } from "../models/adminModel";
import { UserModel } from "../models/UserModel";
import { User } from "../../domain/entities/User";
import { Doctor } from "../../domain/entities/Doctors";
import { DoctorModel } from "../models/DoctorModel";
import mongoose from "mongoose";
import { LookUpDoctor } from "../../domain/types/doctorTypes";

@Service(IAdminRepositoryToken)
export class AdminRepository implements IAdminRepository {
  async findAdminByEmail(email: string): Promise<AdminDocument | null> {
    const admin = await AdminModel.findOne({ email });
    return admin;
  }

  async getAllUsers(): Promise<any> {
    const users = await UserModel.find({}).select("-password -__v -createdAt -updatedAt");
    return users;
  }

  async getAllDoctors(): Promise<any> {
    const doctors = await DoctorModel.find().select("-password -__v -createdAt -updatedAt");
    return doctors;
  }

  async approveRequest(id: mongoose.Types.ObjectId): Promise<void> {
    await DoctorModel.findByIdAndUpdate(id, { $set: { isApproved: true } }, { new: true });
  }

  async rejectRequest(id: mongoose.Types.ObjectId): Promise<Doctor | null> {
    const response = await DoctorModel.findByIdAndUpdate(id, { $set: { isApproved: false } }, { new: true });
    return response;
  }
  async doctorDetails(): Promise<LookUpDoctor | null> {
    const response = await DoctorModel.aggregate([
      {
        $lookup: {
          from: "doctordetails",
          localField: "_id",
          foreignField: "doctorId",
          as: "doctorDetails",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          isActive: 1,
          status: 1,
          isApproved: 1,
          doctorDetails: 1,
        },
      },
    ]);

    if (response && response.length > 0) {
      return response[0] as LookUpDoctor;
    } else {
      return null;
    }
  }

  async unblockById(id: mongoose.Types.ObjectId): Promise<void> {
    await UserModel.findOneAndUpdate({ _id: id }, { $set: { status: "active" } });
  }

  async blockById(id: mongoose.Types.ObjectId): Promise<User | null> {
    return await UserModel.findOneAndUpdate({ _id: id }, { $set: { status: "blocked" } }, { new: true });
  }
}
