"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const userSubscription_model_1 = require("../../../infrastructure/models/userSubscription-model");
const premiumSubscriptionModel_1 = require("../../../infrastructure/models/premiumSubscriptionModel");
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
const http_1 = require("../../../shared/constants/http");
const chatModel_1 = __importDefault(require("../../../infrastructure/models/chatModel"));
const checkMessageLimit = (0, catchErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const userSubscription = yield userSubscription_model_1.UserSubscriptionModel.findOne({
        userId,
        status: "active",
    });
    (0, appAssert_1.default)(userSubscription, http_1.FORBIDDEN, "You need an active subscription to send messages.");
    const plan = yield premiumSubscriptionModel_1.PremiumSubscriptionModel.findById(userSubscription.subscriptionId);
    (0, appAssert_1.default)(plan, http_1.BAD_REQUEST, "Subscription plan not found.");
    const messageLimits = {
        basic: 10,
        premium: 50,
        enterprise: Infinity,
    };
    const messageLimit = messageLimits[plan.type] || 10;
    const messageCount = yield chatModel_1.default.countDocuments({
        senderId: userId,
        createdAt: { $gte: new Date(userSubscription.startDate), $lte: new Date(userSubscription.endDate) }
    });
    if (messageCount >= messageLimit) {
        return res.status(http_1.FORBIDDEN).json({ success: false, message: "Message limit reached. Upgrade your plan!" });
    }
    next();
}));
exports.default = checkMessageLimit;
