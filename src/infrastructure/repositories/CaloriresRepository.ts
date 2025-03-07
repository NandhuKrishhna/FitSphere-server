import { Service } from "typedi";
import {
  ICaloriesDetailsRepository,
  ICaloriesDetailsRepositoryToken,
} from "../../application/repositories/ICaloriesDetailsRepository";
import { IUserDetails, UserDetailsModel } from "../models/user.addition.details";
import mongoose from "mongoose";
import { CalorieIntakeModel, ICalorieIntake } from "../models/caloriesIntakeModel";
import { FoodLogModel, IFoodItem } from "../models/food.logs";
import { ObjectId } from "../models/UserModel";

@Service(ICaloriesDetailsRepositoryToken)
export class CaloriesRepository implements ICaloriesDetailsRepository {
  async createCaloriesDetails(userId: mongoose.Types.ObjectId, data: IUserDetails): Promise<IUserDetails> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let calorieIntake = await CalorieIntakeModel.findOne({ userId, date: today });
    if (!calorieIntake) {
      calorieIntake = new CalorieIntakeModel({
        userId,
        date: today,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
        },
        requiredCalories: data.targetDailyCalories,
        totalCalories: 0,
      });
      await calorieIntake.save();
    }

    const user = await UserDetailsModel.create({ ...data, userId });
    return user;
  }

  async addMeal(userId: mongoose.Types.ObjectId, foodItem: IFoodItem, mealType: string): Promise<ICalorieIntake> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let calorieIntake = await CalorieIntakeModel.findOne({
      userId,
      date: today,
    });

    if (!calorieIntake) {
      calorieIntake = new CalorieIntakeModel({
        userId,
        date: today,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
        },
      });
    }
    calorieIntake.meals[mealType as keyof typeof calorieIntake.meals].push(foodItem);
    const updatedLog = await calorieIntake.save();

    return updatedLog;
  }

  async getFoodLogs(userId: mongoose.Types.ObjectId, date?: Date): Promise<ICalorieIntake | null> {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);
    const foodLog = await CalorieIntakeModel.findOne({ userId, date: targetDate });
    return foodLog;
  }

  async getUserHealthDetails(userId: mongoose.Types.ObjectId): Promise<IUserDetails | null> {
    const user = await UserDetailsModel.findOne({ userId }).select("-password -__v -_id");
    return user;
  }

  async deleteFoodLogByFoodId(
    userId: mongoose.Types.ObjectId,
    foodId: mongoose.Types.ObjectId,
    date: Date
  ): Promise<void> {
    console.log(date, foodId, userId);

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);

    // Check if the food log exists before deletion
    const existingLog = await CalorieIntakeModel.findOne({ userId, date: targetDate });
    console.log("Before Deletion:", existingLog);

    if (!existingLog) {
      console.log("No food log found for this user and date.");
      return;
    }

    const objectIdFoodId = new mongoose.Types.ObjectId(foodId);

    // First remove the food item
    const updatedDoc = await CalorieIntakeModel.findOneAndUpdate(
      { userId, date: targetDate },
      {
        $pull: {
          "meals.breakfast": { _id: objectIdFoodId },
          "meals.lunch": { _id: objectIdFoodId },
          "meals.dinner": { _id: objectIdFoodId },
          "meals.snacks": { _id: objectIdFoodId },
        },
      },
      { new: true } // Return updated document
    );

    console.log("After Deletion:", updatedDoc);

    if (!updatedDoc) {
      console.log("Food item not found or not deleted.");
      return;
    }

    // Recalculate totals
    await CalorieIntakeModel.findOneAndUpdate(
      { userId, date: targetDate },
      [
        {
          $set: {
            totalCalories: {
              $sum: [
                { $sum: "$meals.breakfast.calories" },
                { $sum: "$meals.lunch.calories" },
                { $sum: "$meals.dinner.calories" },
                { $sum: "$meals.snacks.calories" },
              ],
            },
            totalProtien: {
              $sum: [
                { $sum: "$meals.breakfast.protein" },
                { $sum: "$meals.lunch.protein" },
                { $sum: "$meals.dinner.protein" },
                { $sum: "$meals.snacks.protein" },
              ],
            },
            totalCarbs: {
              $sum: [
                { $sum: "$meals.breakfast.carbs" },
                { $sum: "$meals.lunch.carbs" },
                { $sum: "$meals.dinner.carbs" },
                { $sum: "$meals.snacks.carbs" },
              ],
            },
            totalFats: {
              $sum: [
                { $sum: "$meals.breakfast.fats" },
                { $sum: "$meals.lunch.fats" },
                { $sum: "$meals.dinner.fats" },
                { $sum: "$meals.snacks.fats" },
              ],
            },
          },
        },
      ],
      { new: true }
    );
  }
}
