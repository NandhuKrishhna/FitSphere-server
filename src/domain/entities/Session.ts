import mongoose from "mongoose";
import { UserRole } from "../../shared/utils/jwt";

export class Session {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public userId: mongoose.Types.ObjectId,
    public role : UserRole,
    public expiresAt: Date,
    public createdAt: Date,
    public userAgent?: string | undefined,
  ) {}
}