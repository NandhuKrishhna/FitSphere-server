import mongoose from "mongoose";
import cloudinary from "../../infrastructure/config/cloudinary";
import { DisplayDoctorsParams } from "../../domain/types/doctorTypes";
import { Inject, Service } from "typedi";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";

@Service()
export class AppUseCase {
    constructor(
     @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
     @Inject(IDoctorRepositoryToken) private doctorRespository : IDoctorRepository
    ) {
    }
    async displayAllDoctors({page , limit , search , sort} : DisplayDoctorsParams) {
        let sortBy: Record<string, string> = {}; 
    
        if (sort[1]) {
          sortBy[sort[0]] = sort[1]; 
        } else {
          sortBy[sort[0]] = "asc"; 
        }
        
        const doctors =  await this.doctorRespository.fetchAllDoctors({page , limit , search ,sortBy});
        return doctors;
      }
    
      async updateProfile(userId: mongoose.Types.ObjectId, profilePic: string) {
        const uploadResponse =   await cloudinary.uploader.upload(profilePic)
        const updatedUser = await this.userRepository.updateProfile(userId , uploadResponse.secure_url);
        return updatedUser
       }

      async displayDoctorDetails(doctorId : mongoose.Types.ObjectId) {
        const details = await this.doctorRespository.findDoctorDetails(doctorId);
        return details
      } 
}