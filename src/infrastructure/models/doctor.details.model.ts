import mongoose, { Document, Model, Schema } from "mongoose";

export interface DoctorDetailsDocument extends Document {
  _id: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId; 
  bio?: string; 
  professionalTitle: string;
  gender: "Male" | "Female"; 
  profilePicture?: string; 
  contactPhoneNumber: string;
  professionalEmail: string;
  officeAddress: string;
  clinicLocations: string[];
  consultationFees: number;
  consultationLanguages: string[];
  primarySpecialty: string;
  secondarySpecialties: string[];
  areasOfExpertise: string[];
  specificTreatmentFocuses: string[];
  medicalLicenseNumber: string;
  experience: number; 
  createdAt?: Date;
  updatedAt?: Date;
}


const DoctorDetailsSchema: Schema = new Schema<DoctorDetailsDocument>(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    bio: {
      type: String,
      required: false,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    consultationFees: {
      type: Number,
      required: true,
      min: 0,
    },
    contactPhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    professionalEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    officeAddress: {
      type: String,
      required: true,
      trim: true,
    },
    clinicLocations: {
      type: [String],
      required: true,
    },
    consultationLanguages: {
      type: [String],
      required: true,
    },
    primarySpecialty: {
      type: String,
      required: true,
      trim: true,
    },
    secondarySpecialties: {
      type: [String],
      required: false,
    },
    areasOfExpertise: {
      type: [String],
      required: true,
    },
    specificTreatmentFocuses: {
      type: [String],
      required: false,
    },
    medicalLicenseNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    professionalTitle: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


export const DoctorDetailsModel: Model<DoctorDetailsDocument> = mongoose.model<DoctorDetailsDocument>(
  "DoctorDetails",
  DoctorDetailsSchema
);
