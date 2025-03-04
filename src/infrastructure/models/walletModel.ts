import mongoose, { Schema, Document } from "mongoose";
export interface Wallet {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  status: "active" | "inactive" | "suspended";
  transactions: Transaction[];
  createdAt?: Date;
  updatedAt?: Date;
}
export interface Transaction {
  _id: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  description?: string;
  createdAt: Date;
}

export interface WalletDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  status: "active" | "inactive" | "suspended";
  transactions: Transaction[];
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new Schema<Transaction>({
  type: { type: String, enum: ["credit", "debit"], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const WalletSchema = new Schema<WalletDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, required: true, default: 0 },
  currency: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
  transactions: { type: [TransactionSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const WalletModel = mongoose.model<WalletDocument>("Wallet", WalletSchema);
