import mongoose from "mongoose";
import { IDoctorRepository, IDoctorRepositoryToken } from "../../application/repositories/IDoctorReposirtory";
import { Service } from "typedi";
import { Doctor } from "../../domain/entities/Doctors";
import { DoctorDetails } from "../../domain/entities/DoctorDetails";
import { DoctorDetailsModel } from "../models/doctor.details.model";
import { DoctorModel } from "../models/DoctorModel";

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

}
