import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
export interface ITransaction extends Document {
  from: mongoose.Types.ObjectId;
  fromModel: "User" | "Doctor";
  to?: mongoose.Types.ObjectId;
  toModel?: "User" | "Doctor";
  amount: number;
  type: "credit" | "debit" | "failed";
  method: "wallet" | "razorpay";
  paymentType: "subscription" | "slot_booking" | "wallet_payment" | "cancel_appointment" | "refund";
  status: "pending" | "success" | "failed";
  transactionId: string;
  currency?: string;
  subscriptionId?: string;
  bookingId?: string;
  paymentGatewayId?: string;
  relatedTransactionId?: string;
}
const transactionSchema = new Schema<ITransaction>(
  {
    from: { type: Schema.Types.ObjectId, refPath: "fromModel", required: true },
    fromModel: { type: String, enum: ["User", "Doctor"], required: true },
    to: { type: Schema.Types.ObjectId, refPath: "toModel", required: false },
    toModel: { type: String, enum: ["User", "Doctor"], required: false },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit", "debit", "failed"], required: true },
    method: { type: String, enum: ["wallet", "razorpay"], required: true },
    paymentType: { type: String, enum: ["subscription", "slot_booking", "wallet_payment", "cancel_appointment" , "refund"], required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    transactionId: { type: String, default: uuidv4, unique: true },
    currency: { type: String, default: "INR" },
    subscriptionId: { type: String, ref: "Subscription", required: false },
    bookingId: { type: String, ref: "Booking", required: false },
    paymentGatewayId: { type: String, required: false },
    relatedTransactionId: { type: String, required: false },
  },
  { timestamps: true }
);

transactionSchema.index({ from: 1 });
transactionSchema.index({ to: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ subscriptionId: 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ relatedTransactionId: 1 });
const TransactionModel = mongoose.model<ITransaction>("Transaction", transactionSchema);

export default TransactionModel;
