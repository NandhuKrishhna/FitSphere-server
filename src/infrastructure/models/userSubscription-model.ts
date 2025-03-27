import mongoose, { Model, Schema } from "mongoose";
import { ObjectId } from "./UserModel";
export interface IUserSubscription {
    userId: ObjectId
    subscriptionId: ObjectId
    startDate: Date
    endDate: Date
    status: string
    paymentId?: string
}

const UserSubscription: Schema<IUserSubscription> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "PremiumSubscription", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "expired", "cancelled"], required: true, default: "active" },
    paymentId: { type: String, required: false },
});

export const UserSubscriptionModel: Model<IUserSubscription> = mongoose.model<IUserSubscription>("UserSubscription", UserSubscription);