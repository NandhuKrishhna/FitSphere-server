import mongoose from "mongoose";

export class DoctorDetails {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public doctorId: mongoose.Types.ObjectId | string,
    public experience: string,
    public consultationFees: string,
    public contactPhoneNumber: string,
    public professionalEmail: string,
    public officeAddress: string,
    public clinicLocations: string,
    public consultationLanguages: string,
    public primarySpecialty: string,
    public medicalLicenseNumber: string,
    public gender: "Male" | "Female",
    public professionalTitle: string,
    public profilePicture?: string,
    public bio?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {
    this.doctorId = doctorId??professionalEmail
  }
}
