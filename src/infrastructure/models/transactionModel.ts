import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
export interface ITransaction extends Document {
  from: mongoose.Types.ObjectId;
  to?: mongoose.Types.ObjectId;
  amount: number;
  type: "credit" | "debit";
  method: "wallet" | "razorpay";
  paymentType: "subscription" | "slot_booking";
  status: "pending" | "success" | "failed";
  transactionId: string;
}

const transactionSchema = new Schema<ITransaction>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "Doctor", required: false },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    method: { type: String, enum: ["wallet", "razorpay"], required: true },
    paymentType: { type: String, enum: ["subscription", "slot_booking"], required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    transactionId: { type: String, default: uuidv4, unique: true },
  },
  { timestamps: true }
);

transactionSchema.index({ from: 1 });
transactionSchema.index({ to: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionId: 1 }, { unique: true });

const TransactionModel = mongoose.model<ITransaction>("Transaction", transactionSchema);

export default TransactionModel;
