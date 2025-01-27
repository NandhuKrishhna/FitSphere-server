import mongoose, { Document, Model, Schema } from "mongoose";
import { OtpCodeTypes } from "../../shared/constants/verficationCodeTypes";


export interface otpVerificaionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: OtpCodeTypes;
  code : string
  expiresAt: Date;
  createdAt: Date;

}

const otpVerificaionSchema = new Schema<otpVerificaionDocument>({
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

  const OtpVerficationModel : Model<otpVerificaionDocument> =
  mongoose.model<otpVerificaionDocument>("OtpVerfication", otpVerificaionSchema, "otp_verfication");
  export default OtpVerficationModel;
  