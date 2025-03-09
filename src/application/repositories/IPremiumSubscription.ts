import { Token } from "typedi";
import { IPremiumSubscription } from "../../infrastructure/models/premiumSubscriptionModel";
import { ObjectId } from "../../infrastructure/models/UserModel";

export interface IPremiumSubscriptionRepository {
  subscribeOne(type: string, price: number, useId: ObjectId): Promise<IPremiumSubscription>;
}

export const IPremiumSubscriptionRepositoryToken = new Token<IPremiumSubscriptionRepository>();
