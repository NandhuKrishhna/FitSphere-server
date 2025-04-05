import mongoose from "mongoose";
import { Token } from "typedi";
import { TUserDetails } from "../../../domain/types/calories.Types";
import { IUserDetails } from "../../../infrastructure/models/user.addition.details";
import { ICalorieIntake, IFoodItem } from "../../../infrastructure/models/caloriesIntakeModel";
import { IFoodItemResponse } from "../interface-types/UseCase-types";
import { IWeightLog } from "../../../infrastructure/models/weightLog.model";
import { ObjectId } from "../../../infrastructure/models/UserModel";

export interface ICaloriesUseCase {
    addUserHealthDetails(userId: ObjectId, data: TUserDetails): Promise<IUserDetails>;
    updateUserDetails(userId: ObjectId, data: Partial<IUserDetails>): Promise<void>;
    getUserHealthDetails(userId: ObjectId): Promise<IUserDetails | null>;
    addMeal(userId: ObjectId, mealType: string, foodItems: IFoodItem, date: string): Promise<ICalorieIntake>;
    getFoodLogs(userId: ObjectId, date?: Date): Promise<ICalorieIntake | null>;
    deleteFood(userId: ObjectId, foodId: ObjectId, date: Date, mealType: string): Promise<void>;
    searchFoodForFoodLog(ingredients: string, quantity?: number): Promise<IFoodItemResponse[]>;
    editFood(
        userId: ObjectId,
        foodId: ObjectId,
        date: string,
        updatedFoodItem: IFoodItem,
        mealType: string
    ): Promise<mongoose.Types.ObjectId>;
    getWeightLogs(userId: ObjectId): Promise<IWeightLog[] | null>

};
export const ICaloriesUseCaseToken = new Token<ICaloriesUseCase>();