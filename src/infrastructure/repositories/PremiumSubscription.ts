import { Service } from "typedi";
import {
  IPremiumSubscriptionRepository,
  IPremiumSubscriptionRepositoryToken,
} from "../../application/repositories/IPremiumSubscription";
import { IPremiumSubscription, PremiumSubscriptionModel } from "../models/premiumSubscriptionModel";
import { ObjectId } from "../models/UserModel";
import mongoose from "mongoose";

@Service(IPremiumSubscriptionRepositoryToken)
export class PremiumSubscriptionRepository implements IPremiumSubscriptionRepository {
  async createSubscription(subcription: Partial<IPremiumSubscription>): Promise<IPremiumSubscription> {
    return await PremiumSubscriptionModel.create(subcription);
  }

  async getSubscriptionById(subscriptionId: ObjectId): Promise<IPremiumSubscription | null> {
    return await PremiumSubscriptionModel.findOne({ _id: subscriptionId });
  }
  async getSubscriptionByUserId(userId: ObjectId): Promise<IPremiumSubscription | null> {
    return await PremiumSubscriptionModel.findOne({ userId: userId });
  }

  async editPremiumSubscription(subscriptionId: mongoose.Types.ObjectId, subcription: Partial<IPremiumSubscription>): Promise<IPremiumSubscription | null> {
    return await PremiumSubscriptionModel.findOneAndUpdate({ _id: subscriptionId }, subcription, { new: true, })
  }

  async deletePremiumSubscription(subscriptionId: ObjectId): Promise<void> {
    await PremiumSubscriptionModel.deleteOne({ _id: subscriptionId });
  }
  async getAllPremiumSubscription(): Promise<IPremiumSubscription[]> {
    return await PremiumSubscriptionModel.find({}).sort({ createdAt: -1 });
  }
}
