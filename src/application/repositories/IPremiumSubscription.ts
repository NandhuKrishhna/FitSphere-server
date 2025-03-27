import { Token } from "typedi";
import { IPremiumSubscription } from "../../infrastructure/models/premiumSubscriptionModel";
import { ObjectId } from "../../infrastructure/models/UserModel";
import mongoose from "mongoose";

export interface IPremiumSubscriptionRepository {
  createSubscription(subcription: Partial<IPremiumSubscription>): Promise<IPremiumSubscription>;
  getSubscriptionById(subscriptionId: ObjectId): Promise<IPremiumSubscription | null>;
  getSubscriptionByUserId(userId: ObjectId): Promise<IPremiumSubscription | null>;
  editPremiumSubscription(subscriptionId: mongoose.Types.ObjectId, subcription: Partial<IPremiumSubscription>): Promise<IPremiumSubscription | null>;
  deletePremiumSubscription(subscriptionId: ObjectId): Promise<void>;
  getAllPremiumSubscription(): Promise<IPremiumSubscription[]>
}

export const IPremiumSubscriptionRepositoryToken = new Token<IPremiumSubscriptionRepository>();
