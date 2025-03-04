import { Service } from "typedi";
import {
  ICaloriesDetailsRepository,
  ICaloriesDetailsRepositoryToken,
} from "../../application/repositories/ICaloriesDetailsRepository";
import { IUserDetails, UserDetailsModel } from "../models/user.addition.details";
import mongoose from "mongoose";
import { CalorieIntakeModel, ICalorieIntake } from "../models/caloriesIntakeModel";
import { IFoodItem } from "../models/food.logs";
import { ObjectId } from "../models/UserModel";

@Service(ICaloriesDetailsRepositoryToken)
export class CaloriesRepository implements ICaloriesDetailsRepository {
  async createCaloriesDetails(userId: mongoose.Types.ObjectId, data: IUserDetails): Promise<IUserDetails> {
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
}
