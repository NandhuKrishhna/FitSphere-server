import mongoose, { model, Schema } from "mongoose";
import { thirtyDaysFromNow } from "../../shared/utils/date";

export interface SessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessionSchema = new Schema<SessionDocument>({
  userId: {
    ref: "User",
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
  },
  userAgent: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, default: thirtyDaysFromNow },
});

const SessionModel = model<SessionDocument>("Session", sessionSchema);
export default SessionModel;