import { Service } from "typedi";
import {
  IPremiumSubscriptionRepository,
  IPremiumSubscriptionRepositoryToken,
} from "../../application/repositories/IPremiumSubscription";
import { IPremiumSubscription, PremiumSubscriptionModel } from "../models/premiumSubscriptionModel";
import { ObjectId } from "../models/UserModel";

@Service(IPremiumSubscriptionRepositoryToken)
export class PremiumSubscriptionRepository implements IPremiumSubscriptionRepository {
  async subscribeOne(type: string, price: number, userId: ObjectId): Promise<IPremiumSubscription> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const subscriptionInfo = new PremiumSubscriptionModel({
      userId,
      type,
      planName: `${type.charAt(0).toUpperCase() + type.slice(1)} Plan`,
      price,
      currency: "INR",
      startDate,
      endDate,
      status: "active",
      autoRenew: false,
    });
    await subscriptionInfo.save();

    return subscriptionInfo;
  }
}
