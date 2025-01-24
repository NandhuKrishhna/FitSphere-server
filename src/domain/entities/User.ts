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
      public createdAt?: Date,
      public updatedAt?: Date
    ) {}

    omitPassword(){
      const {password, ...rest} = this;
      return rest;
    }
    comparePassword(val: string ): Promise<boolean> {
      return bcrypt.compare(val, this.password);
    }
};