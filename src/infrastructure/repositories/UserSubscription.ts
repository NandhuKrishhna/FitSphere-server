import { Service } from "typedi";
import { IUserSubscriptionRepository, IUserSubscriptionRepositoryToken } from "../../application/repositories/IUserSubscriptionRepository";
import mongoose from "mongoose";
import { UserSubscriptionModel } from "../models/userSubscription-model";
export type AddSubscriptionParams = {
    userId: mongoose.Types.ObjectId,
    subscriptionId: mongoose.Types.ObjectId
    paymentId?: mongoose.Types.ObjectId

}
@Service(IUserSubscriptionRepositoryToken)
export class UserSubscriptionRepository implements IUserSubscriptionRepository {
    async addSubscription({ userId, subscriptionId, paymentId }: AddSubscriptionParams): Promise<void> {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const newSubscription = new UserSubscriptionModel({
            userId,
            subscriptionId,
            startDate,
            endDate,
            paymentId
        });

        await newSubscription.save();
    }

}