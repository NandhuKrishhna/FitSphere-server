import { Token } from "typedi";
import { IPremiumSubscription } from "../../infrastructure/models/premiumSubscriptionModel";
import { ObjectId } from "../../infrastructure/models/UserModel";

export interface IPremiumSubscriptionRepository {
  createSubscription(subcription: Partial<IPremiumSubscription>): Promise<IPremiumSubscription>;
  getSubscriptionById(subscriptionId: ObjectId): Promise<IPremiumSubscription | null>;
  getSubscriptionByUserId(userId: ObjectId): Promise<IPremiumSubscription | null>;
}

export const IPremiumSubscriptionRepositoryToken = new Token<IPremiumSubscriptionRepository>();
