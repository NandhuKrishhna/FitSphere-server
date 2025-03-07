import axios from "axios";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST } from "../../shared/constants/http";
import { Inject, Service } from "typedi";
import { getRecipeByIngredientsUrl, getRecipeInformationUrl } from "../../shared/utils/SponnerApi";
import { DeepSeek_Api_key } from "../../shared/constants/env";
import mongoose from "mongoose";
import {
  ICaloriesDetailsRepository,
  ICaloriesDetailsRepositoryToken,
} from "../repositories/ICaloriesDetailsRepository";
import { TUserDetails } from "../../domain/types/calories.Types";
import { calculateTargetCalories } from "../../shared/utils/calorieCalculator";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { IFoodItem } from "../../infrastructure/models/food.logs";
@Service()
export class CaloriesUseCase {
  constructor(@Inject(ICaloriesDetailsRepositoryToken) private caloriesDetailsRepository: ICaloriesDetailsRepository) {}

  public async searchFood(ingredients: string) {
    appAssert(ingredients, BAD_REQUEST, "Invalid ingredients");
    const sponnerApiUrl = getRecipeByIngredientsUrl(ingredients);
    // const sponnerApiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${ingredients}`;
    console.log(sponnerApiUrl);
    const response = await axios.get(sponnerApiUrl);
    return response.data;
  }

  public async getRecipeByIngredients(recipeId: string) {
    appAssert(recipeId, BAD_REQUEST, "Invalid ingredients");
    // const sponnerApiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
    const sponnerApiUrl = getRecipeInformationUrl(recipeId);
    const respones = await axios.get(sponnerApiUrl);
    return respones.data;
  }

  public async updateUserDetails(userId: ObjectId, data: TUserDetails) {
    appAssert(userId, BAD_REQUEST, "Invalid userId");
    appAssert(data, BAD_REQUEST, "Invalid data");
    const targetDailyCalories = calculateTargetCalories(data);
    const updatedData = { ...data, targetDailyCalories };
    await this.caloriesDetailsRepository.createCaloriesDetails(userId, updatedData);
  }

  public async getUserHealthDetails(userId: ObjectId) {
    appAssert(userId, BAD_REQUEST, "Invalid userId");
    return await this.caloriesDetailsRepository.getUserHealthDetails(userId);
  }

  async addMeal(userId: ObjectId, mealType: string, foodItems: IFoodItem) {
    console.log("Meal Type:", mealType);
    console.log("FoodItems:", foodItems);
    appAssert(foodItems, BAD_REQUEST, "Invalid foodItems");
    appAssert(mealType, BAD_REQUEST, "Invalid mealType");
    await this.caloriesDetailsRepository.addMeal(userId, foodItems, mealType);
  }

  //get foodlogs
  public async getFoodLogs(userId: ObjectId, date?: Date) {
    appAssert(userId, BAD_REQUEST, "Invalid userId");
    return await this.caloriesDetailsRepository.getFoodLogs(userId, date);
  }

  // delete food log by id
  public async deleteFood(userId: ObjectId, foodId: ObjectId, date: Date) {
    appAssert(userId, BAD_REQUEST, "Please Login to delete food log");
    appAssert(foodId, BAD_REQUEST, "Something went wrong. Please try again");
    await this.caloriesDetailsRepository.deleteFoodLogByFoodId(userId, foodId, date);
  }
}
