import mongoose from "mongoose";

export class Session {
  constructor(
    public userId: mongoose.Types.ObjectId,
    public createdAt: Date,
    public expiresAt: Date,
    public _id?: mongoose.Types.ObjectId,
    public userAgent?: string | undefined,
  ) {}
}