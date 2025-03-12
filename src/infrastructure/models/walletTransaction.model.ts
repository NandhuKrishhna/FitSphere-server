import mongoose, { Schema, Document } from "mongoose";

export interface TransactionDocument extends Document {
  walletId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  description?: string;
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
    description: { type: String },
  },
  { timestamps: true }
);

export const TransactionModel = mongoose.model<TransactionDocument>("Transaction", TransactionSchema);
