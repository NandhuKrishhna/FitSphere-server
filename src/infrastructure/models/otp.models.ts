import mongoose, { Document, Model, Schema } from "mongoose";
import { OtpCodeTypes } from "../../shared/constants/verificationCodeTypes";


export interface otpVerificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: OtpCodeTypes;
  code: string
  expiresAt: Date;
  createdAt: Date;

}

const otpVerificaionSchema = new Schema<otpVerificationDocument>({
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
  code: {
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

const OtpVerficationModel: Model<otpVerificationDocument> =
  mongoose.model<otpVerificationDocument>("OtpVerfication", otpVerificaionSchema, "otp_verfication");
export default OtpVerficationModel;
