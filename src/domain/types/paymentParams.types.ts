import { ObjectId } from "../../infrastructure/models/UserModel";

export type VerifyPaymentParams = {
    userId: ObjectId;
    doctorId?: ObjectId;
    razorpay_order_id: string;
    doctorName?: string,
    paymentType: "slot_booking" | "subscription" | "wallet_payment",
    subscriptionId?: ObjectId
};