import mongoose, { Schema, Document } from "mongoose";

export interface TransactionDocument extends Document {
  walletId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role:"User" | "Doctor"
  type: "credit" | "debit";
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  description?: string;
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    userId: { type: Schema.Types.ObjectId, required:true , refPath:"role" },
    role :{type: String , enum:["User","Doctor"] , required:true},
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
    description: { type: String },
  },
  { timestamps: true }
);

export const WalletTransactionModel = mongoose.model<TransactionDocument>("WalletTransaction", TransactionSchema);
