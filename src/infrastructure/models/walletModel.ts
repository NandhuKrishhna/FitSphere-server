import mongoose, { Schema, Document } from "mongoose";
export interface Wallet {
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  status: "active" | "inactive" | "suspended";
}
export interface WalletDocument extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  status: "active" | "inactive" | "suspended";
}

const WalletSchema = new Schema<WalletDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export const WalletModel = mongoose.model<WalletDocument>("Wallet", WalletSchema);
