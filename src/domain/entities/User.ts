import bcrypt from "bcrypt";
import mongoose from "mongoose";
export class User {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public name: string,
    public email: string,
    public password: string,
    public isActive: boolean = true,
    public isPremium: boolean = false,
    public role: "user" | "doctor" = "user",
    public isVerfied: boolean = false,
    public status: "blocked" | "deleted" | "active" = "active",
    public profilePicture?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  omitPassword() {
    const { password, ...rest } = this;
    return rest;
  }
  comparePassword(val: string): Promise<boolean> {
    return bcrypt.compare(val, this.password);
  }
}

export type UserType = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
  isPremium?: boolean;
  role?: "user" | "doctor";
  isVerfied?: boolean;
  status?: "blocked" | "deleted" | "active";
  profilePicture?: null | string;
  createdAt?: Date;
  updatedAt?: Date;
  omitPassword(): Pick<
    UserType,
    "_id" | "name" | "email" | "isActive" | "isPremium" | "role" | "isVerfied" | "status" | "createdAt" | "updatedAt"
  >;
  comparePassword(val: string): Promise<boolean>;
};
