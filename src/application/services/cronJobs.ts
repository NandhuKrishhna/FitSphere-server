// services/cronJobs.ts
import cron from "node-cron";
import { UserDetailsModel } from "../../infrastructure/models/user.addition.details";
import { FoodLog } from "../../infrastructure/models/food.logs";

export const setupFoodLogCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const users = await UserDetailsModel.find().select("_id targetDailyCalories");
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const bulkOps = users.map((user) => ({
        updateOne: {
          filter: {
            userId: user._id,
            date: today,
          },
          update: {
            $setOnInsert: {
              userId: user._id,
              date: today,
              targetCalories: user.targetDailyCalories,
              meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: [],
              },
            },
          },
          upsert: true,
        },
      }));

      await FoodLog.bulkWrite(bulkOps);
    } catch (error) {
      console.error("Error generating daily food logs:", error);
    }
  });
};
