import { Token } from "typedi";

import mongoose from "mongoose";
import { Doctor } from "../../domain/entities/Doctors";
import { DoctorDetails } from "../../domain/entities/DoctorDetails";

export interface IDoctorRepository { 
    findDoctorByEmail(email: string): Promise<Doctor | null>
    createDoctor(details: Doctor): Promise<Doctor>
    createDoctorDetails(details:DoctorDetails): Promise<DoctorDetails>
    findDoctorByID(id: mongoose.Types.ObjectId): Promise<Doctor>
    findDoctorDetails(doctorId : mongoose.Types.ObjectId): Promise<DoctorDetails>
    updateUserById(id: mongoose.Types.ObjectId, updates: Partial<Doctor>): Promise<Doctor | null>;
    
}



export const IDoctorRepositoryToken = new Token<IDoctorRepository>();


