import { Service } from "typedi";
import { IDoctorRepositoryToken } from "../../application/repositories/IDoctorRepository";
import { Doctor } from "../../domain/entities/Doctors";
import { DoctorModel } from "../models/doctor.model";
import { DoctorDetailsModel } from "../models/doctor.details.model";
import { DoctorDetails } from "../../domain/entities/DoctorDetails";
import mongoose from "mongoose";



@Service(IDoctorRepositoryToken)
export class DoctorRepository {
    async findDoctorByEmail(email: string): Promise<Doctor | null> {
        const doctor  = await DoctorModel.findOne({ email });
        return doctor
    }

    async createDoctor(doctor: Doctor): Promise<Doctor> {
        const result  = await DoctorModel.create(doctor);
        return result;
    }
    async createDoctorDetails(details:DoctorDetails): Promise<DoctorDetails> {
        const result = await DoctorDetailsModel.create(details);
        return result
    }

    async findDoctorByID(id: string): Promise<Doctor | null> {
        const result  = await DoctorModel.findOne({id});
        return result;
    }
    async findDoctorDetails(doctorId : string): Promise<DoctorDetails | null> {
        const result  = await DoctorDetailsModel.findOne({ doctorId });
        return result;
    }
    async updateUserById(id: mongoose.Types.ObjectId, updates: Partial<Doctor>): Promise<Doctor | null> {
        const result = await DoctorModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
          )
          return result;
}
}