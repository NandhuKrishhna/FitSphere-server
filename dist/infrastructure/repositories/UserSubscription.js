"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscriptionRepository = void 0;
const typedi_1 = require("typedi");
const IUserSubscriptionRepository_1 = require("../../application/repositories/IUserSubscriptionRepository");
const userSubscription_model_1 = require("../models/userSubscription-model");
const premiumSubscriptionModel_1 = require("../models/premiumSubscriptionModel");
let UserSubscriptionRepository = class UserSubscriptionRepository {
    addSubscription(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, subscriptionId, paymentId }) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            const newSubscription = new userSubscription_model_1.UserSubscriptionModel({
                userId,
                subscriptionId,
                startDate,
                endDate,
                paymentId
            });
            yield newSubscription.save();
        });
    }
    getSubscriptionDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userSubscription = yield userSubscription_model_1.UserSubscriptionModel.findOne({ userId: userId });
                if (!userSubscription) {
                    return null;
                }
                const premiumSubscription = yield premiumSubscriptionModel_1.PremiumSubscriptionModel.findById(userSubscription.subscriptionId);
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
            }
            catch (error) {
                console.error("Error fetching subscription details:", error);
                return null;
            }
        });
    }
    createDefaultSubscription(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionPlans = yield premiumSubscriptionModel_1.PremiumSubscriptionModel.find({ type: "basic" });
            if (subscriptionPlans.length > 0) {
                const subscriptionPlan = subscriptionPlans[0];
                yield this.addSubscription({ userId, subscriptionId: subscriptionPlan._id });
            }
        });
    }
    deleteExistingSubscription(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            yield userSubscription_model_1.UserSubscriptionModel.deleteOne({ userId });
        });
    }
};
exports.UserSubscriptionRepository = UserSubscriptionRepository;
exports.UserSubscriptionRepository = UserSubscriptionRepository = __decorate([
    (0, typedi_1.Service)(IUserSubscriptionRepository_1.IUserSubscriptionRepositoryToken)
], UserSubscriptionRepository);
