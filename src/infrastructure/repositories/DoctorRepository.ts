import mongoose, { PipelineStage } from "mongoose";
import { IDoctorRepository, IDoctorRepositoryToken } from "../../application/repositories/IDoctorReposirtory";
import { Service } from "typedi";
import { Doctor } from "../../domain/entities/Doctors";
import { DoctorDetails } from "../../domain/entities/DoctorDetails";
import { DoctorDetailsDocument, DoctorDetailsModel } from "../models/doctor.details.model";
import { DoctorDocument, DoctorModel } from "../models/DoctorModel";
import { DoctorProfile, DoctorwithDetails, UpdateDoctorParams } from "../../domain/types/doctorTypes";
import bcrypt from "bcrypt";
import { UserModel } from "../models/UserModel";
import RatingModel from "../models/RatingsModel";
import { DoctorStats } from "../../application/user-cases/interface-types/UseCase-types";
interface MatchStage {
  isApproved: boolean;
  isVerified: boolean;
  status: string;
  $or?: { [key: string]: any }[];
}

@Service(IDoctorRepositoryToken)
export class DoctorRepository implements IDoctorRepository {
  async findDoctorByEmail(email: string): Promise<DoctorDocument | null> {
    const doctor = await DoctorModel.findOne({ email })
    return doctor;
  }


  async createDoctor(doctor: DoctorDocument): Promise<DoctorDocument> {
    const result = await DoctorModel.create(doctor);
    return result;
  }
  async createDoctorDetails(details: DoctorDetails): Promise<DoctorDetailsDocument> {
    const result = await DoctorDetailsModel.create(details);
    return result;
  }

  async findDoctorDetails(doctorId: mongoose.Types.ObjectId): Promise<DoctorDetails | null> {
    const result = await DoctorDetailsModel.findOne({ doctorId });
    return result;
  }
  async updateUserById(id: mongoose.Types.ObjectId, updates: Partial<DoctorDocument>): Promise<DoctorDocument | null> {
    const result = await DoctorModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return result;
  }
  async decoration(id: mongoose.Types.ObjectId): Promise<void> {
    await DoctorModel.deleteOne({ _id: id });
  }

  async findDoctorByID(id: mongoose.Types.ObjectId): Promise<DoctorDocument | null> {
    const doctor = await DoctorModel.findOne({ _id: id });
    return doctor;
  }

  async deleteDoctorById(id: mongoose.Types.ObjectId): Promise<void> {
    await DoctorModel.deleteOne({ _id: id });
  }

  async deleteDoctorDetails(id: mongoose.Types.ObjectId): Promise<void> {
    await DoctorDetailsModel.deleteOne({ doctorId: id });
  }

  // fetching all doctors
  async fetchAllDoctors({
    page,
    limit,
    search,
    sortBy,
    gender,
    specialty,
    language,
    experience,
  }: UpdateDoctorParams): Promise<{
    doctors: DoctorwithDetails[];
    total: number;
  }> {
    try {
      const matchStage: PipelineStage.Match = {
        $match: {
          isApproved: true,
          isVerified: true,
          status: "active",
        },
      };

      // Add search conditions
      if (search) {
        matchStage.$match.$or = [
          { name: { $regex: search, $options: "i" } },
          { "doctorDetails.primarySpecialty": { $regex: search, $options: "i" } },
          { "doctorDetails.consultationLanguages": { $regex: search, $options: "i" } },
        ];
      }

      // Add filter conditions
      if (gender && gender.length > 0) {
        matchStage.$match["doctorDetails.gender"] = { $in: gender };
      }
      if (specialty && specialty.length > 0) {
        matchStage.$match["doctorDetails.primarySpecialty"] = { $in: specialty };
      }
      if (language && language.length > 0) {
        matchStage.$match["doctorDetails.consultationLanguages"] = { $in: language };
      }
      if (experience && experience > 0) {
        matchStage.$match["doctorDetails.experience"] = { $gte: experience };
      }

      const pipeline: PipelineStage[] = [
        {
          $lookup: {
            from: "doctordetails",
            localField: "_id",
            foreignField: "doctorId",
            as: "doctorDetails",
          },
        },
        { $unwind: { path: "$doctorDetails", preserveNullAndEmptyArrays: true } },
        matchStage,
        {
          $project: {
            _id: 1,
            name: 1,
            profilePicture: 1,
            "doctorDetails.experience": 1,
            "doctorDetails.consultationFees": 1,
            "doctorDetails.primarySpecialty": 1,
            "doctorDetails.gender": 1,
            "doctorDetails.professionalTitle": 1,
            "doctorDetails.consultationLanguages": 1,
          },
        },
      ];

      // Add sorting
      if (Object.keys(sortBy).length > 0) {
        const sortStage: PipelineStage.Sort = {
          $sort: Object.entries(sortBy).reduce((acc, [key, value]) => {
            acc[key] = value.toLowerCase() === "desc" ? -1 : 1;
            return acc;
          }, {} as Record<string, 1 | -1>),
        };
        pipeline.push(sortStage);
      }

      // Calculate total
      const totalPipeline = [...pipeline];
      const countStage: PipelineStage.Count = { $count: "total" };
      const countResult = await DoctorModel.aggregate([...totalPipeline, countStage]);
      const total = countResult[0]?.total || 0;

      // Add pagination
      const skipStage: PipelineStage.Skip = { $skip: page * limit };
      const limitStage: PipelineStage.Limit = { $limit: limit };
      pipeline.push(skipStage, limitStage);

      const doctors = await DoctorModel.aggregate(pipeline);

      return { doctors, total };
    } catch (error) {
      console.error("Error in fetchAllDoctors:", error);
      throw error;
    }
  }

  async fetchDoctorandDetailsById(id: mongoose.Types.ObjectId): Promise<DoctorProfile | null> {
    try {
      const result = await DoctorModel.aggregate([
        {
          $match: {
            _id: id,
          },
        },
        {
          $lookup: {
            from: "doctordetails",
            localField: "_id",
            foreignField: "doctorId",
            as: "details",
          },
        },
        {
          $unwind: "$details",
        },
        {
          $project: {
            password: 0,
            isVerified: 0,
            isApproved: 0,
            createdAt: 0,
            updatedAt: 0,
            "details.createdAt": 0,
            "details.updatedAt": 0,
            __v: 0,
          },
        },
      ]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Error fetching doctor details::", error);
      throw new Error("Failed to fetch doctor details.");
    }
  }


  async updateDoctorDetailsByDocId(id: mongoose.Types.ObjectId, updates: Partial<DoctorDetails>): Promise<DoctorDetailsDocument | null> {
    const result = await DoctorDetailsModel.findOneAndUpdate(
      { doctorId: id },
      { $set: updates },
      { new: true }
    );
    return result;
  }
  async updatePassword(userId: mongoose.Types.ObjectId, newPassword: string, role: string): Promise<void> {
    try {
      const Model = role === "user" ? (UserModel as mongoose.Model<any>) : (DoctorModel as mongoose.Model<any>);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await Model.findByIdAndUpdate(
        userId,
        { $set: { password: hashedPassword } },
        { new: true }
      );
      if (!result) {
        throw new Error("User not found or password update failed");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      throw new Error("Failed to update password. Please try again.");
    }
  }

  async getDoctorStatistics(): Promise<DoctorStats> {
    const stats = await DoctorModel.aggregate([
      {
        $group: {
          _id: null,
          totalDoctors: { $sum: 1 },
          approvedDoctors: { $sum: { $cond: [{ $eq: ["$isApproved", true] }, 1, 0] } },
          verifiedDoctors: { $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] } }
        }
      }
    ]);

    const topDoctors = await RatingModel.aggregate([
      {
        $sort: { averageRating: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorDetails"
        }
      },
      {
        $unwind: "$doctorDetails"
      },
      {
        $project: {
          _id: "$doctorDetails._id",
          name: "$doctorDetails.name",
          email: "$doctorDetails.email",
          profilePicture: "$doctorDetails.profilePicture",
          averageRating: 1,
          totalReviews: 1
        }
      }
    ]);

    return {
      totalDoctors: stats.length > 0 ? stats[0].totalDoctors : 0,
      approvedDoctors: stats.length > 0 ? stats[0].approvedDoctors : 0,
      verifiedDoctors: stats.length > 0 ? stats[0].verifiedDoctors : 0,
      topDoctors
    };
  }


}