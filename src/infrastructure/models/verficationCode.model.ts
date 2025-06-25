import mongoose, { Document, Model, Schema } from "mongoose";
import { VerificationCodeTypes } from "../../shared/constants/verificationCodeTypes";

export interface VerficationCodeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: VerificationCodeTypes;
  expiresAt: Date;
  createdAt: Date;
  _id: mongoose.Types.ObjectId
}

const verificationCodeSchema = new Schema<VerficationCodeDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,

    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const VerificationCodeModel: Model<VerficationCodeDocument> =
  mongoose.model<VerficationCodeDocument>("VerificationCode", verificationCodeSchema, "verification_codes");
export default VerificationCodeModel;
