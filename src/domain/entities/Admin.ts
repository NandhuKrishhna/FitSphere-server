import mongoose from "mongoose";
import bcrypt from "bcrypt";
export class Admin {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public name: string,
    public email: string,
    public password: string,
    public profilePicture: string,
    public role: string,
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
