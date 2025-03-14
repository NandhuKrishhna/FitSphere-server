import { Token } from "typedi";
import { IUserDetails } from "../../infrastructure/models/user.addition.details";
import mongoose from "mongoose";
import { TUserDetails } from "../../domain/types/calories.Types";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { IFoodItem } from "../../infrastructure/models/food.logs";
import { ICalorieIntake } from "../../infrastructure/models/caloriesIntakeModel";

export interface ICaloriesDetailsRepository {
  createCaloriesDetails(userId: mongoose.Types.ObjectId, data: TUserDetails): Promise<IUserDetails>;
  addMeal(userId: ObjectId, foodItems: IFoodItem, mealType: string): Promise<ICalorieIntake>;
  getFoodLogs(userId: ObjectId, date?: Date): Promise<ICalorieIntake | null>;
  getUserHealthDetails(userId: ObjectId): Promise<IUserDetails | null>;
  deleteFoodLogByFoodId(userId: ObjectId, foodId: ObjectId, date: Date): Promise<void>;
}

export const ICaloriesDetailsRepositoryToken = new Token<ICaloriesDetailsRepository>();
