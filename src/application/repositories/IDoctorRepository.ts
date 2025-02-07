import { Token } from "typedi";
import { Doctor } from "../../domain/entities/Doctors"
import { DoctorDetails } from "../../domain/entities/DoctorDetails";
import mongoose from "mongoose";

export interface IDoctorRepository { 
    findDoctorByEmail(email: string): Promise<Doctor | null>;
    createDoctor(details: Doctor): Promise<Doctor>;
    createDoctorDetails(details:DoctorDetails): Promise<DoctorDetails>;
    findDoctorByID(id: mongoose.Types.ObjectId): Promise<Doctor>
    findDoctorDetails(doctorId : mongoose.Types.ObjectId): Promise<DoctorDetails | null>
    updateUserById(id: mongoose.Types.ObjectId, updates: Partial<Doctor>): Promise<Doctor | null>;
    deleteDoctorById(id: mongoose.Types.ObjectId):Promise<void>
    deleteDoctorDetails(id: mongoose.Types.ObjectId):Promise<void>
}



export const IDoctorRepositoryToken = new Token<IDoctorRepository>();


