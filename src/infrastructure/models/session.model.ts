import mongoose, { model, Schema } from "mongoose";
import { thirtyDaysFromNow } from "../../shared/utils/date";
import { UserRole } from "../../shared/utils/jwt";

export interface SessionDocument extends Document {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: UserRole;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
}

const sessionSchema = new Schema<SessionDocument>({
  userId: {
    ref: "User",
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "doctor", "user"],
    required: true,
  },
  userAgent: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, default: thirtyDaysFromNow },
});

const SessionModel = model<SessionDocument>("Session", sessionSchema);
export default SessionModel;
