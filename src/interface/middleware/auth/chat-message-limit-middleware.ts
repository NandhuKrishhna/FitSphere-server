import { Request, Response, NextFunction } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { UserSubscriptionModel } from "../../../infrastructure/models/userSubscription-model";
import { AuthenticatedRequest } from "./authMiddleware";
import { PremiumSubscriptionModel } from "../../../infrastructure/models/premiumSubscriptionModel";
import appAssert from "../../../shared/utils/appAssert";
import { BAD_REQUEST, FORBIDDEN } from "../../../shared/constants/http";
import ChatModel from "../../../infrastructure/models/chatModel";

const checkMessageLimit = catchErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req as AuthenticatedRequest


    const userSubscription = await UserSubscriptionModel.findOne({
        userId,
        status: "active",
    });
    appAssert(userSubscription, FORBIDDEN, "You need an active subscription to send messages.");
    const plan = await PremiumSubscriptionModel.findById(userSubscription.subscriptionId);
    appAssert(plan, BAD_REQUEST, "Subscription plan not found.");
    const messageLimits: { [key: string]: number } = {
        basic: 10,
        premium: 50,
        enterprise: Infinity,
    };

    const messageLimit = messageLimits[plan.type] || 10;

    const messageCount = await ChatModel.countDocuments({
        senderId: userId,
        createdAt: { $gte: new Date(userSubscription.startDate), $lte: new Date(userSubscription.endDate) }
    });

    if (messageCount >= messageLimit) {
        return res.status(FORBIDDEN).json({ success: false, message: "Message limit reached. Upgrade your plan!" });
    }
    next();
});

export default checkMessageLimit;
