import cron from "node-cron";
import { UserDetailsModel } from "../../infrastructure/models/user.addition.details";
import { FoodLogModel } from "../../infrastructure/models/food.logs";

export const setupFoodLogCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const users = await UserDetailsModel.find().select(
        "_id targetDailyCalories weight goal targetWeight weeksToGoal"
      );

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const bulkOps = users.map((user) => ({
        updateOne: {
          filter: { userId: user._id, date: today },
          update: {
            $setOnInsert: {
              userId: user._id,
              date: today,
              targetCalories: user.targetDailyCalories,
              meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
            },
          },
          upsert: true,
        },
      }));

      await FoodLogModel.bulkWrite(bulkOps);
      await updateUserWeight();
    } catch (error) {
      console.error("Error generating daily food logs:", error);
    }
  });
};

const updateUserWeight = async () => {
  try {
    const users = await UserDetailsModel.find().select("_id weight goal targetWeight weeksToGoal targetDailyCalories");

    for (const user of users) {
      const { _id, weight, goal, targetWeight, weeksToGoal, targetDailyCalories } = user;
      const yesterday = new Date();
      yesterday.setUTCHours(0, 0, 0, 0);
      yesterday.setDate(yesterday.getDate() - 1);

      const foodLog = await FoodLogModel.findOne({ userId: _id, date: yesterday });

      if (!foodLog) continue;

      const totalCaloriesConsumed = foodLog.totalConsumed || 0;

      if (Math.abs(totalCaloriesConsumed - targetDailyCalories) <= targetDailyCalories * 0.05) {
        const weightChangePerDay = (targetWeight - weight) / (weeksToGoal * 7);

        if (goal === "lose" && weight > targetWeight) {
          user.weight = Math.max(weight + weightChangePerDay, targetWeight);
        } else if (goal === "gain" && weight < targetWeight) {
          user.weight = Math.min(weight + weightChangePerDay, targetWeight);
        }

        await user.save();
      }
    }
  } catch (error) {
    console.error("Error updating user weights:", error);
  }
};
