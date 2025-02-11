import mongoose, { PipelineStage } from "mongoose";
import { IDoctorRepository, IDoctorRepositoryToken } from "../../application/repositories/IDoctorReposirtory";
import { Service } from "typedi";
import { Doctor } from "../../domain/entities/Doctors";
import { DoctorDetails } from "../../domain/entities/DoctorDetails";
import { DoctorDetailsModel } from "../models/doctor.details.model";
import { DoctorModel } from "../models/DoctorModel";
import { DoctorwithDetails, UpdateDoctorParams } from "../../domain/types/doctorTypes";


interface MatchStage {
  isApproved: boolean;
  isVerified: boolean;
  status: string;
  $or?: { [key: string]: any }[];
}



@Service(IDoctorRepositoryToken)
export class DoctorRepository implements IDoctorRepository {
  async findDoctorByEmail(email: string): Promise<Doctor | null> {
    const doctor = await DoctorModel.findOne({ email });
    return doctor;
  }

  async createDoctor(doctor: Doctor): Promise<Doctor> {
    const result = await DoctorModel.create(doctor);
    return result;
  }
  async createDoctorDetails(details: DoctorDetails): Promise<DoctorDetails> {
    const result = await DoctorDetailsModel.create(details);
    return result;
  }

  async  findDoctorDetails(doctorId : mongoose.Types.ObjectId): Promise<DoctorDetails | null> {
    const result = await DoctorDetailsModel.findOne({ doctorId });
    return result;
  }
  async updateUserById(
    id: mongoose.Types.ObjectId,
    updates: Partial<Doctor>
  ): Promise<Doctor | null> {
    const result = await DoctorModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    return result;
  }
  async decoration(id: mongoose.Types.ObjectId): Promise<void> {
    await DoctorModel.deleteOne({ _id: id });
  }

  async findDoctorByID(id: mongoose.Types.ObjectId): Promise<Doctor> {
    const doctor = await DoctorModel.findOne({ _id: id });
    return doctor as Doctor;
}

  async deleteDoctorById(id: mongoose.Types.ObjectId): Promise<void> {
      await DoctorModel.deleteOne({_id:id})
  }

  async deleteDoctorDetails(id: mongoose.Types.ObjectId): Promise<void> {
      await DoctorDetailsModel.deleteOne({doctorId:id})
  }
  // fetching all doctors 
  async fetchAllDoctors({ page, limit, search, sortBy }: UpdateDoctorParams): Promise<{ doctors: DoctorwithDetails[], total: number }> {
    try {
        const matchStage: PipelineStage.Match = {
            $match: {
                isApproved: true,
                isVerified: true,
                status: "active"
            }
        };

        if (search) {
            matchStage.$match = {
                ...matchStage.$match,
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { "doctorDetails.primarySpecialty": { $regex: search, $options: 'i' } },
                    { "doctorDetails.consultationLanguages": { $regex: search, $options: 'i' } }
                ]
            };
        }

        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: "doctordetails",
                    localField: "_id",
                    foreignField: "doctorId",
                    as: "doctorDetails"
                }
            },
            {
                $unwind: {
                    path: "$doctorDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            matchStage,
            {
                $project: {
                    _id: 1,
                    name: 1,
                    ProfilePicture: 1,
                    "doctorDetails.experience": 1,
                    "doctorDetails.consultationFees": 1,
                    "doctorDetails.primarySpecialty": 1,
                    "doctorDetails.gender": 1,
                    "doctorDetails.professionalTitle": 1,
                    "doctorDetails.consultationLanguages": 1
                }
            }
        ];

        if (Object.keys(sortBy).length > 0) {
            const sortStage: PipelineStage.Sort = {
                $sort: Object.entries(sortBy).reduce((acc, [key, value]) => {
                    acc[key] = value.toLowerCase() === 'desc' ? -1 : 1;
                    return acc;
                }, {} as Record<string, 1 | -1>)
            };
            pipeline.push(sortStage);
        }

        const totalPipeline = [...pipeline];
        const countStage: PipelineStage.Count = { $count: 'total' };
        const countResult = await DoctorModel.aggregate([...totalPipeline, countStage]);
        const total = countResult[0]?.total || 0;

        const skipStage: PipelineStage.Skip = { $skip: page * limit };
        const limitStage: PipelineStage.Limit = { $limit: limit };
        pipeline.push(skipStage, limitStage);

        const doctors = await DoctorModel.aggregate(pipeline);

        return {
            doctors,
            total
        };
    } catch (error) {
        console.error('Error in fetchAllDoctors:', error);
        throw error;
    }
}
      

}
