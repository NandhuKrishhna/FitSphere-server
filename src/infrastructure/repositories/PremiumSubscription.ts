import { Service } from "typedi";
import {
  IPremiumSubscriptionRepository,
  IPremiumSubscriptionRepositoryToken,
} from "../../application/repositories/IPremiumSubscription";
import { IPremiumSubscription, PremiumSubscriptionModel } from "../models/premiumSubscriptionModel";
import { ObjectId } from "../models/UserModel";

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
}
