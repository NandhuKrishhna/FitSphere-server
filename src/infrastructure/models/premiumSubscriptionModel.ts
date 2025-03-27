import mongoose, { Schema, Document } from "mongoose";
export const enum PremiumType {
  BASIC = "basic",
  PREMIUM = "premium",
  ETERPRISE = "enterprise",
}
export interface IPremiumSubscription extends Document {
  type: string;
  planName: string;
  price: number;
  features: string[];
}

const PremiumSubscriptionSchema = new Schema<IPremiumSubscription>(
  {
    type: {
      type: String,
      enum: ["basic", "premium", "enterprise"],
      required: true,
    },
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    features: { type: [String], required: true },
  },
  { timestamps: true }
);

export const PremiumSubscriptionModel = mongoose.model<IPremiumSubscription>(
  "PremiumSubscription",
  PremiumSubscriptionSchema
);
