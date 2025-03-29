import { CalorieIntakeModel } from "../../infrastructure/models/caloriesIntakeModel";
import { UserDetailsModel } from "../../infrastructure/models/user.addition.details";
import logger from "../../shared/utils/logger";
import cron from "node-cron";

export const setupCalorieIntakeCron = async () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const existingLogs = await CalorieIntakeModel.findOne({ date: today });

  if (!existingLogs) {
    await createCalorieLogs(today);
  } else {
  }
  cron.schedule("0 0 * * *", async () => {
    await createCalorieLogs(new Date());
  });
};
const createCalorieLogs = async (date: Date) => {
  try {
    const users = await UserDetailsModel.find().select("userId targetDailyCalories");


    if (users.length === 0) {
      return;
    }

    date.setUTCHours(0, 0, 0, 0);

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
    } else {
    }
  } catch (error) {

  }
};
