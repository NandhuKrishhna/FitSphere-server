import mongoose, { Schema, Document } from "mongoose";
export interface IPremiumSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  type: "basic" | "premium" | "pro";
  planName: string;
  price: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const PremiumSubscriptionSchema = new Schema<IPremiumSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["basic", "premium", "pro"],
      required: true,
    },
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const PremiumSubscriptionModel = mongoose.model<IPremiumSubscription>(
  "PremiumSubscription",
  PremiumSubscriptionSchema
);
