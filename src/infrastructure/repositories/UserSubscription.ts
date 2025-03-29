import { Service } from "typedi";
import { IUserSubscriptionRepository, IUserSubscriptionRepositoryToken } from "../../application/repositories/IUserSubscriptionRepository";
import mongoose from "mongoose";
import { IUserSubscription, UserSubscriptionModel } from "../models/userSubscription-model";
import { PremiumSubscriptionModel } from "../models/premiumSubscriptionModel";
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

    async getSubscriptionDetails(userId: mongoose.Types.ObjectId): Promise<any | null> {
        try {

            const userSubscription = await UserSubscriptionModel.findOne({ userId: userId });
            if (!userSubscription) {
                return null;
            }
            const premiumSubscription = await PremiumSubscriptionModel.findById(userSubscription.subscriptionId);

            if (!premiumSubscription) {
                return null;
            }

            return {
                _id: userSubscription._id,
                userId: userSubscription.userId,
                subscriptionId: userSubscription.subscriptionId,
                startDate: userSubscription.startDate,
                endDate: userSubscription.endDate,
                status: userSubscription.status,
                planName: premiumSubscription.planName,
                type: premiumSubscription.type,
                price: premiumSubscription.price,
                features: premiumSubscription.features
            };
        } catch (error) {
            console.error("Error fetching subscription details:", error);
            return null;
        }
    }

    async createDefaultSubscription(userId: mongoose.Types.ObjectId): Promise<void> {
        const subscriptionPlans = await PremiumSubscriptionModel.find({ type: "basic" });
        if (subscriptionPlans.length > 0) {
            const subscriptionPlan = subscriptionPlans[0];
            await this.addSubscription({ userId, subscriptionId: subscriptionPlan._id as mongoose.Types.ObjectId });
        }
    }

    async deleteExistingSubscription({ userId }: { userId: mongoose.Types.ObjectId }): Promise<void> {
        await UserSubscriptionModel.deleteOne({ userId });
    }


}