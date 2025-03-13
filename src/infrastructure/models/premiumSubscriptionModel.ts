import mongoose, { Schema, Document } from "mongoose";
export const enum PremiumType {
  BASIC = "basic",
  PREMIUM = "premium",
  ETERPRISE = "enterprise",
}
export interface IPremiumSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  type: "basic" | "premium" | "enterprise";
  planName: string;
  price: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "cancelled" | "not_active";
}

const PremiumSubscriptionSchema = new Schema<IPremiumSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["basic", "premium", "enterprise"],
      required: true,
    },
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "not_active"],
      default: "not_active",
    },
  },
  { timestamps: true }
);

export const PremiumSubscriptionModel = mongoose.model<IPremiumSubscription>(
  "PremiumSubscription",
  PremiumSubscriptionSchema
);
