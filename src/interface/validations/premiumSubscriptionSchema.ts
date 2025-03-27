import { z } from "zod";

const premiumSubscriptionSchema = z.object({
    type: z.string().min(1, "Subscription type is required"),
    price: z.number(),
    features: z.array(z.string().min(1, "Feature cannot be empty")).min(1, "At least one feature is required"),
    planName: z.string().min(1, "Plan name is required"),
});

export default premiumSubscriptionSchema;
export const editPremiumSubscriptionSchema = premiumSubscriptionSchema.partial();