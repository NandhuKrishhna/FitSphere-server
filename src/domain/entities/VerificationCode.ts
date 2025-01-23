import mongoose from "mongoose";

export class VerificationCode {
    constructor(
      public userId: mongoose.Types.ObjectId,
      public type: string,
      public expiresAt?: Date,
      public createdAt?: Date,
      public _id? :mongoose.Types.ObjectId
    ) {}
}