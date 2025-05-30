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
import appAssert from "../../shared/utils/appAssert";
import { NOT_FOUND } from "../../shared/constants/http";

@Service(ICaloriesDetailsRepositoryToken)
export class CaloriesRepository implements ICaloriesDetailsRepository {
  async createCaloriesDetails(userId: mongoose.Types.ObjectId, data: IUserDetails): Promise<IUserDetails> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let calorieIntake = await CalorieIntakeModel.findOne({ userId });
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

  async addMeal(
    userId: mongoose.Types.ObjectId,
    foodItem: IFoodItem,
    mealType: string,
    date: string
  ): Promise<ICalorieIntake> {
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);

    let calorieIntake = await CalorieIntakeModel.findOne({
      userId,
      date: formattedDate,
    });

    if (!calorieIntake) {
      calorieIntake = new CalorieIntakeModel({
        userId,
        date: formattedDate,
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
  async findFoodLogById(userId: ObjectId, foodId: ObjectId, date: Date, mealType: string): Promise<ICalorieIntake | null> {
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    const pathToMealArray = `meals.${mealType}`;
    const result = await CalorieIntakeModel.findOne(
      {
        userId,
        date: targetDate,
        [`${pathToMealArray}._id`]: foodId,
      },
      {
        [`${pathToMealArray}.$`]: 1,
      }
    );
    return result
  }

  async deleteFoodLogByFoodId(
    userId: mongoose.Types.ObjectId,
    foodId: mongoose.Types.ObjectId,
    date: Date,
  ): Promise<void> {

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);
    const existingLog = await CalorieIntakeModel.findOne({ userId, date: targetDate });

    if (!existingLog) {
      appAssert(false, NOT_FOUND, "Food log not found for the given date.");
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

    if (!updatedDoc) {
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
    date: string,
    updatedFoodItem: IFoodItem,
    mealType: string
  ): Promise<mongoose.Types.ObjectId> {
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

    const foodIndex = mealArray.findIndex((food) => food._id?.toString() === foodId.toString());
    if (foodIndex === -1) {
      throw new Error(`Food item not found in the meal. FoodId: ${foodId}, MealType: ${mealType}`);
    }

    mealArray[foodIndex] = { ...updatedFoodItem, _id: new mongoose.Types.ObjectId() };

    await calorieIntake.save();

    return mealArray[foodIndex]._id as mongoose.Types.ObjectId
  }


  async getWeightLogsByUserId(userId: ObjectId): Promise<IWeightLog[] | null> {
    return await WeightLogModel.find({ userId: userId }).lean()
  }
  async updateUserDetails(userId: ObjectId, data: Partial<IUserDetails>): Promise<void> {
    const updatedUser = await UserDetailsModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

}
