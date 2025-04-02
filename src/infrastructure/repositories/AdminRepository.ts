import { Service } from "typedi";
import { IAdminRepository, IAdminRepositoryToken } from "../../application/repositories/IAdminRepository";
import { AdminDocument, AdminModel } from "../models/adminModel";
import { UserDocument, UserModel } from "../models/UserModel";
import { DoctorDocument, DoctorModel } from "../models/DoctorModel";
import mongoose from "mongoose";
import { LookUpDoctor } from "../../domain/types/doctorTypes";
import { DoctorQueryParams, UserQueryParams } from "../../domain/types/queryParams.types";
export type PaginatedUsers = {
  users: UserDocument[];
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  blockedUsers: number;
  currentPage: number;
  totalPages: number;
};

export type PaginatedDoctors = {
  doctors: DoctorDocument[];
  totalDoctors: number;
  currentPage: number;
  totalPages: number;
  verifiedDoctors: number;
  activeDoctors: number;
  blockedDoctors: number;
  pendingDoctors: number;
  approvedDoctors: number;
};
@Service(IAdminRepositoryToken)
export class AdminRepository implements IAdminRepository {
  async findAdminByEmail(email: string): Promise<AdminDocument | null> {
    const admin = await AdminModel.findOne({ email });
    return admin;
  }

  async getAllUsers(queryParams: UserQueryParams): Promise<PaginatedUsers | null> {
    const { page = "1", limit = "5", sortBy = "createdAt", sortOrder = "desc", search, email, name, isVerfied, isActive, status } = queryParams;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const filter: any = {};

    if (email) {
      filter.email = email;
    }
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (isVerfied !== undefined) {
      filter.isVerfied = isVerfied === "true";
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (status) {
      filter.status = status;
    }

    const users = await UserModel.find(filter)
      .select("-password -__v -createdAt -updatedAt")
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const totalUsers = await UserModel.countDocuments();
    const verifiedUsers = await UserModel.countDocuments({ isVerfied: true });
    const activeUsers = await UserModel.countDocuments({ isActive: true });
    const blockedUsers = await UserModel.countDocuments({ status: "blocked" });

    return {
      users,
      totalUsers,
      verifiedUsers,
      activeUsers,
      blockedUsers,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalUsers / pageSize),
    };
  }

  async getAllDoctors(queryParams: DoctorQueryParams): Promise<PaginatedDoctors | null> {
    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      email,
      name,
      status,
      isApproved,
      isVerified,
      isActive
    } = queryParams;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const filter: any = {};

    if (email) {
      filter.email = email;
    }
    if (name) {
      filter.name = name
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (isVerified !== undefined) {
      filter.isVerfied = isVerified === "true";
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (isApproved !== undefined) {
      filter.isApproved = isApproved === "true";
    }

    if (status) {
      filter.status = status;
    }


    const doctors = await DoctorModel.find(filter)
      .select("-password -__v -createdAt -updatedAt")
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const totalDoctors = await DoctorModel.countDocuments(filter);
    const verifiedDoctors = await DoctorModel.countDocuments({ isVerfied: true });
    const activeDoctors = await DoctorModel.countDocuments({ isActive: true });
    const blockedDoctors = await DoctorModel.countDocuments({ status: "blocked" });
    const pendingDoctors = await DoctorModel.countDocuments({ isApproved: false });
    const approvedDoctors = await DoctorModel.countDocuments({ isApproved: true });

    return {
      doctors,
      totalDoctors,
      verifiedDoctors,
      activeDoctors,
      blockedDoctors,
      pendingDoctors,
      approvedDoctors,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalDoctors / pageSize),
    };
  }



  async approveRequest(id: mongoose.Types.ObjectId): Promise<DoctorDocument | null> {
    return await DoctorModel.findByIdAndUpdate(id, { $set: { isApproved: true } }, { new: true });
  }

  async rejectRequest(id: mongoose.Types.ObjectId): Promise<DoctorDocument | null> {
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

  async unblockById(id: mongoose.Types.ObjectId, role: string): Promise<UserDocument | DoctorDocument | null> {
    if (role === "user") {
      return await UserModel.findOneAndUpdate({ _id: id }, { $set: { status: "active" } }, { new: true });
    } else {
      return await DoctorModel.findOneAndUpdate({ _id: id }, { $set: { status: "active" } }, { new: true });
    }
  }

  async blockById(
    id: mongoose.Types.ObjectId,
    role: string
  ): Promise<UserDocument | DoctorDocument | null> {
    if (role === "user") {
      return await UserModel.findOneAndUpdate(
        { _id: id },
        { $set: { status: "blocked" } },
        { new: true }
      );
    } else {
      return await DoctorModel.findOneAndUpdate(
        { _id: id },
        { $set: { status: "blocked" } },
        { new: true }
      );
    }
  }

}