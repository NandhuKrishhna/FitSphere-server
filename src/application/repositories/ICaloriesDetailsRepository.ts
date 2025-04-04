import { Token } from "typedi";
import { IUserDetails } from "../../infrastructure/models/user.addition.details";
import mongoose from "mongoose";

import { ObjectId } from "../../infrastructure/models/UserModel";
import { ICalorieIntake, IFoodItem } from "../../infrastructure/models/caloriesIntakeModel";
import { IWeightLog } from "../../infrastructure/models/weightLog.model";
import { TUserDetails } from "../../domain/types/calories.Types";

export interface ICaloriesDetailsRepository {
  createCaloriesDetails(userId: mongoose.Types.ObjectId, data: TUserDetails): Promise<IUserDetails>;
  addMeal(userId: ObjectId, foodItems: IFoodItem, mealType: string, date: string): Promise<ICalorieIntake>;
  getFoodLogs(userId: ObjectId, date?: Date): Promise<ICalorieIntake | null>;
  getUserHealthDetails(userId: ObjectId): Promise<IUserDetails | null>;
  deleteFoodLogByFoodId(userId: ObjectId, foodId: ObjectId, date: Date): Promise<void>;
  editFoodLog(userId: ObjectId, foodId: ObjectId, date: string, updatedFoodItem: IFoodItem, mealType: string): Promise<mongoose.Types.ObjectId>;
  getWeightLogsByUserId(userId: ObjectId): Promise<IWeightLog[] | null>
  updateUserDetails(userId: ObjectId, data: Partial<IUserDetails>): Promise<void>;
}

export const ICaloriesDetailsRepositoryToken = new Token<ICaloriesDetailsRepository>();
