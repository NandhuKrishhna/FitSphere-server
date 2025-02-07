import mongoose from "mongoose";

export type RegisterDoctorParams = {
    name: string;
    email: string;
    password: string;
    userAgent?: string;
  };


  export type DoctorDetailsParams = {
    bio?: string;
    experience: string;
    consultationFees: string;
    contactPhoneNumber: string;
    professionalEmail: string;
    officeAddress: string;
    clinicLocations: string; 
    consultationLanguages: string;
    primarySpecialty: string; 
    medicalLicenseNumber: string;
    profilePicture?: string; 
    gender: "Male" | "Female";
    professionalTitle: string;
    certificate?: string
  };
  
  
  interface LookUpDoctorDetails {
    bio: string;
    experience: string;
    consultationFees: string;
    contactPhoneNumber: string;
    professionalEmail: string;
    officeAddress: string;
    clinicLocations: string;
    consultationLanguages: string;
    primarySpecialty: string;
    medicalLicenseNumber: string;
    profilePicture: string;
    gender: string;
    professionalTitle: string;
    createdAt: string;
    updatedAt: string;
  }
  
 export  interface LookUpDoctor {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    isApproved : boolean;
    status: string;
    doctorDetails: LookUpDoctorDetails[];
  }
  