import mongoose from "mongoose";
import { Token } from "typedi";
import { AddSubscriptionParams } from "../../infrastructure/repositories/UserSubscription";

export interface IUserSubscriptionRepository {
    addSubscription({ userId, subscriptionId, paymentId }: AddSubscriptionParams): Promise<void>
}
export const IUserSubscriptionRepositoryToken = new Token<IUserSubscriptionRepository>();