import { Service } from "typedi";
import {
  ICaloriesDetailsRepository,
  ICaloriesDetailsRepositoryToken,
} from "../../application/repositories/ICaloriesDetailsRepository";
import { IUserDetails, UserDetailsModel } from "../models/user.addition.details";
import mongoose from "mongoose";
import { CalorieIntakeModel, ICalorieIntake, IFoodItem } from "../models/caloriesIntakeModel";
import { ObjectId } from "../models/UserModel";
import { IWeightLog, WeightLogModel } from "../models/weightLog.model";

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
      { new: true }
    );

    console.log("After Deletion:", updatedDoc);

    if (!updatedDoc) {
      console.log("Food item not found or not deleted.");
      return;
    }

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
            requiredCalories: "$requiredCalories",
          },
        },
      ],
      { new: true }
    );
  }
  async editFoodLog(
    userId: mongoose.Types.ObjectId,
    foodId: mongoose.Types.ObjectId,
    date: Date,
    updatedFoodItem: IFoodItem,
    mealType: string
  ): Promise<void> {
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);
    const calorieIntake = await CalorieIntakeModel.findOne({ userId, date: formattedDate });
    if (!calorieIntake) {
      throw new Error("Calorie intake record not found for the given date.");
    }
    const mealArray = calorieIntake.meals[mealType as keyof typeof calorieIntake.meals];
    if (!mealArray) {
      throw new Error(`Invalid meal type: ${mealType}`);
    }
    console.log("Existing food IDs in meal:", mealArray.map((item) => item._id?.toString()));
  
    const foodIndex = mealArray.findIndex((food) => food._id?.toString() === foodId.toString());
    
    if (foodIndex === -1) {
      throw new Error(`Food item not found in the meal. FoodId: ${foodId}, MealType: ${mealType}`);
    }
    mealArray[foodIndex] = { ...mealArray[foodIndex], ...updatedFoodItem };
  
    const updatedLog = await calorieIntake.save();
  }
  
  async getWeightLogsByUserId(userId:ObjectId):Promise<IWeightLog[] | null>{
    return await WeightLogModel.find({userId:userId}).lean()
  }

}
