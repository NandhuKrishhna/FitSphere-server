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

  async addMeal(
    userId: ObjectId,
    foodItem: IFoodItem,
    mealType: keyof ICalorieIntake["meals"]
  ): Promise<ICalorieIntake> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const updatedLog = await CalorieIntakeModel.findOneAndUpdate(
      { userId, date: today },
      {
        $push: { [`meals.${mealType}`]: foodItem },
        $inc: { totalCalories: foodItem.calories },
      },
      { new: true, upsert: true }
    );

    return updatedLog!;
  }
}
