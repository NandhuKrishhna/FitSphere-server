import mongoose, { Schema, Document } from "mongoose";

export interface WalletDocument extends Document {
  userId: mongoose.Types.ObjectId;
  role: "User" | "Doctor";
  balance: number;
  currency: string;
  status: "active" | "inactive" | "suspended";
}

const WalletSchema = new Schema<WalletDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, refPath: "role" },
    role: { type: String, enum: ["User", "Doctor"], required: true },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "INR" },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export const WalletModel = mongoose.model<WalletDocument>("Wallet", WalletSchema);
