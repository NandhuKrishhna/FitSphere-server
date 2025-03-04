import mongoose, { Document, Model, Schema } from "mongoose";

import { comparePassword, hashPassword } from "../../shared/utils/bcrypt";
export type ObjectId = mongoose.Types.ObjectId;
export interface UserDocument extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  isPremium: boolean;
  role: "user" | "doctor";
  isVerfied: boolean;
  status: "blocked" | "deleted" | "active";
  profilePicture: string;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    UserDocument,
    "_id" | "name" | "email" | "isActive" | "isPremium" | "role" | "isVerfied" | "status" | "createdAt" | "updatedAt"
  >;
}

const UserSchema: Schema = new Schema<UserDocument>(
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
    isPremium: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "doctor"],
      default: "user",
    },
    isVerfied: {
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
      required: false,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
  },
  {
    timestamps: true,
  }
);
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password as string);
});

UserSchema.methods.comparePassword = async function (val: string): Promise<boolean> {
  return comparePassword(val, this.password);
};

UserSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User", UserSchema);
