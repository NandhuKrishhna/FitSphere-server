import mongoose, { Document, Model, Schema } from "mongoose";

import { comparePassword, hashPassword } from "../../shared/utils/bcrypt";

export interface DoctorDocument extends Document {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  provider: string;
  role: "user" | "doctor";
  isVerified: boolean;
  isApproved: boolean;
  status: "blocked" | "deleted" | "active";
  profilePicture?: string;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    DoctorDocument,
    "_id" | "name" | "email" | "isActive" | "role" | "isVerified" | "isApproved" | "status" | "profilePicture"
  >;
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
    provider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "doctor"],
      default: "doctor",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["blocked", "deleted", "active"],
      default: "active",
    },
    profilePicture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
  },
  {
    timestamps: true,
  }
);
DoctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password as string);
});

DoctorSchema.methods.comparePassword = async function (val: string): Promise<boolean> {
  return comparePassword(val, this.password);
};

DoctorSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const DoctorModel: Model<DoctorDocument> = mongoose.model<DoctorDocument>("Doctor", DoctorSchema);
