import mongoose, { Document, Model,  Schema } from "mongoose";

import { comparePassword, hashPassword } from "../../shared/utils/bcrypt";

export interface DoctorDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  role: "user" | "doctor";
  isVerified: boolean;
  isApproved : boolean;
  status: "blocked" | "deleted" | "active";
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<DoctorDocument, "_id" | "name" | "email" | "isActive" | "role" | "isVerified" | "isApproved" | "status" | "createdAt" | "updatedAt">;
}

const DoctorSchema: Schema = new Schema<DoctorDocument>(
  { 
  
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "doctor"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved:{
      type: Boolean,
      default:false
    },
    status: {
      type: String,
      enum: ["blocked", "deleted", "active"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);
DoctorSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();
  this.password = await hashPassword(this.password as string);
});

DoctorSchema.methods.comparePassword = async function (val: string): Promise<boolean> {
  return comparePassword(val, this.password);
};

DoctorSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
}

export const DoctorModel : Model<DoctorDocument> = mongoose.model<DoctorDocument>("Doctor", DoctorSchema);