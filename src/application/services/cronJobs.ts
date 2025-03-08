import cron from "node-cron";
import { UserDetailsModel } from "../../infrastructure/models/user.addition.details";
import { CalorieIntakeModel } from "../../infrastructure/models/caloriesIntakeModel";
import logger from "../../shared/utils/logger";

export const setupCalorieIntakeCron = () => {
  cron.schedule("0 0 * * *", async () => {
    logger.info("Calorie intake cron job running...");
    try {
      const users = await UserDetailsModel.find().select("_id targetDailyCalories");

      logger.info(`Found ${users.length} users.`);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const bulkOps = users.map((user) => ({
        updateOne: {
          filter: { userId: user._id, date: today },
          update: {
            $setOnInsert: {
              userId: user._id,
              date: today,
              requiredCalories: user.targetDailyCalories,
              totalCalories: 0,
              totalProtien: 0,
              totalCarbs: 0,
              totalFats: 0,
              meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
            },
          },
          upsert: true,
        },
      }));

      if (bulkOps.length > 0) {
        await CalorieIntakeModel.bulkWrite(bulkOps);
        logger.info("Calorie intake logs created for today.");
      } else {
        logger.info("No logs created.");
      }
    } catch (error) {
      logger.error("Error generating daily calorie logs:", error);
    }
  });
};
