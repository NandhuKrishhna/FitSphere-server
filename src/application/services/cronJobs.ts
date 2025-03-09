import { CalorieIntakeModel } from "../../infrastructure/models/caloriesIntakeModel";
import { UserDetailsModel } from "../../infrastructure/models/user.addition.details";
import logger from "../../shared/utils/logger";
import cron from "node-cron";

export const setupCalorieIntakeCron = async () => {
  logger.info("📅 Checking and registering calorie intake cron job...");
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const existingLogs = await CalorieIntakeModel.findOne({ date: today });

  if (!existingLogs) {
    logger.info("🛠️ No calorie intake logs for today. Creating now...");
    await createCalorieLogs(today);
  } else {
    logger.info("✅ Calorie intake logs already exist for today.");
  }
  cron.schedule("0 0 * * *", async () => {
    logger.info("🕛 New day started! Creating calorie logs...");
    await createCalorieLogs(new Date());
  });
};
const createCalorieLogs = async (date: Date) => {
  try {
    const users = await UserDetailsModel.find().select("userId targetDailyCalories");
    logger.info(`👤 Found ${users.length} users.`);

    if (users.length === 0) {
      logger.warn("⚠️ No users found! Skipping calorie intake creation.");
      return;
    }

    date.setUTCHours(0, 0, 0, 0);
    logger.info(`📅 Creating logs for date: ${date.toISOString()}`);

    const bulkOps = users.map((user) => ({
      updateOne: {
        filter: { userId: user.userId, date },
        update: {
          $setOnInsert: {
            userId: user.userId,
            date,
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
      const result = await CalorieIntakeModel.bulkWrite(bulkOps);
      logger.info(`✅ Calorie intake logs created: ${JSON.stringify(result)}`);
    } else {
      logger.info("📭 No logs were created.");
    }
  } catch (error) {
    logger.error("❌ Error generating daily calorie logs:", error);
  }
};
