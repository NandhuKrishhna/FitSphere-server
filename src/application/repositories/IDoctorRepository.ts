import { Token } from "typedi";
import { Doctor } from "../../domain/entities/Doctors"
import { DoctorDetails } from "../../domain/entities/DoctorDetails";
import mongoose from "mongoose";

export interface IDoctorRepository { 
    findDoctorByEmail(email: string): Promise<Doctor | null>
    createDoctor(details: Doctor): Promise<Doctor>
    createDoctorDetails(details:DoctorDetails): Promise<DoctorDetails>
    findDoctorByID(id: mongoose.Types.ObjectId): Promise<Doctor>
    findDoctorDetails(doctorId : mongoose.Types.ObjectId): Promise<DoctorDetails>
    updateUserById(id: mongoose.Types.ObjectId, updates: Partial<Doctor>): Promise<Doctor | null>;
    
}



export const IDoctorRepositoryToken = new Token<IDoctorRepository>();


