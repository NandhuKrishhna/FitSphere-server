import bcrypt from "bcrypt";
import mongoose from "mongoose";

export class Doctor {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public name: string,
    public email: string,
    public password: string,
    public status: "blocked" | "deleted" | "active" = "active",
    public role: "user" | "doctor" = "doctor",
    public isApproved : boolean = false,
    public isVerified: boolean = false,
    public isActive: boolean = true,
    public ProfilePicture?: string,
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
