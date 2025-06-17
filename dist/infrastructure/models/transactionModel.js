"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const transactionSchema = new mongoose_1.Schema({
    from: { type: mongoose_1.Schema.Types.ObjectId, refPath: "fromModel", required: true },
    fromModel: { type: String, enum: ["User", "Doctor"], required: true },
    to: { type: mongoose_1.Schema.Types.ObjectId, refPath: "toModel", required: false },
    toModel: { type: String, enum: ["User", "Doctor"], required: false },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit", "debit", "failed"], required: true },
    method: { type: String, enum: ["wallet", "razorpay"], required: true },
    paymentType: { type: String, enum: ["subscription", "slot_booking", "wallet_payment", "cancel_appointment", "refund"], required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    transactionId: { type: String, default: uuid_1.v4, unique: true },
    currency: { type: String, default: "INR" },
    subscriptionId: { type: String, ref: "Subscription", required: false },
    bookingId: { type: String, ref: "Booking", required: false },
    paymentGatewayId: { type: String, required: false },
    relatedTransactionId: { type: String, required: false },
}, { timestamps: true });
transactionSchema.index({ from: 1 });
transactionSchema.index({ to: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ subscriptionId: 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ relatedTransactionId: 1 });
const TransactionModel = mongoose_1.default.model("Transaction", transactionSchema);
exports.default = TransactionModel;
