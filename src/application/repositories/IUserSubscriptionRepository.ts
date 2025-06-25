import mongoose from "mongoose";
import { Token } from "typedi";
import { AddSubscriptionParams } from "../../infrastructure/repositories/UserSubscription";
import { IUserSubscription } from "../../infrastructure/models/userSubscription-model";
import { ISubscriptionDetails } from "../user-cases/interface-types/UseCase-types";

export interface IUserSubscriptionRepository {
    addSubscription({ userId, subscriptionId, paymentId }: AddSubscriptionParams): Promise<void>
    getSubscriptionDetails(userId: mongoose.Types.ObjectId): Promise<ISubscriptionDetails | null>;
    createDefaultSubscription(userId: mongoose.Types.ObjectId): Promise<void>;
    deleteExistingSubscription({ userId }: { userId: mongoose.Types.ObjectId }): Promise<void>;
}
export const IUserSubscriptionRepositoryToken = new Token<IUserSubscriptionRepository>();