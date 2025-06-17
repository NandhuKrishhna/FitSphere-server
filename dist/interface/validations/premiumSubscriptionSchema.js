"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPremiumSubscriptionSchema = void 0;
const zod_1 = require("zod");
const premiumSubscriptionSchema = zod_1.z.object({
    type: zod_1.z.string().min(1, "Subscription type is required"),
    price: zod_1.z.number(),
    features: zod_1.z.array(zod_1.z.string().min(1, "Feature cannot be empty")).min(1, "At least one feature is required"),
    planName: zod_1.z.string().min(1, "Plan name is required"),
});
exports.default = premiumSubscriptionSchema;
exports.editPremiumSubscriptionSchema = premiumSubscriptionSchema.partial();
