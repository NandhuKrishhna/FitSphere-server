import { Token } from "typedi";

import mongoose, { MongooseDistinctDocumentMiddleware } from "mongoose";
import { Doctor } from "../../domain/entities/Doctors";
import { DoctorDetails } from "../../domain/entities/DoctorDetails";
import { DisplayDoctorsParams, DoctorDetailsParams, DoctorProfile, DoctorwithDetails, UpdateDoctorParams } from "../../domain/types/doctorTypes";
import { DoctorDetailsDocument } from "../../infrastructure/models/doctor.details.model";
import Role from "../../shared/constants/UserRole";
import { DoctorDocument } from "../../infrastructure/models/DoctorModel";

export interface IDoctorRepository { 
    findDoctorByEmail(email: string): Promise<DoctorDocument | null>
    createDoctor(details: Partial<DoctorDocument>): Promise<DoctorDocument>
    createDoctorDetails(details:DoctorDetails): Promise<DoctorDetails>
    findDoctorByID(id: mongoose.Types.ObjectId): Promise<DoctorDocument | null>
    findDoctorDetails(doctorId : mongoose.Types.ObjectId): Promise<DoctorDetails | null>
    updateUserById(id: mongoose.Types.ObjectId, updates: Partial<DoctorDocument>): Promise<DoctorDocument | null>;
    deleteDoctorById(id:mongoose.Types.ObjectId) : Promise<void>;
    deleteDoctorDetails(id:mongoose.Types.ObjectId) : Promise<void>;
    fetchAllDoctors({ page, limit, search, sortBy }: UpdateDoctorParams): Promise<{
        doctors: DoctorwithDetails[];
        total: number;
      }>
    fetchDoctorandDetailsById(id:mongoose.Types.ObjectId) : Promise<DoctorProfile | null>
    updateDoctorDetailsByDocId(userId : mongoose.Types.ObjectId , details :Partial<DoctorDetailsParams> ) : Promise<DoctorDetailsDocument | null>
    updatePassword(userId : mongoose.Types.ObjectId , newPassword : string , role : string) : Promise<void>
    
}



export const IDoctorRepositoryToken = new Token<IDoctorRepository>();


