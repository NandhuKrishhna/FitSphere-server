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

  async searchFood(ingredients: string) {
    appAssert(ingredients, BAD_REQUEST, "Invalid ingredients");
    const sponnerApiUrl = getRecipeByIngredientsUrl(ingredients);
    // const sponnerApiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${ingredients}`;
    console.log(sponnerApiUrl);
    const response = await axios.get(sponnerApiUrl);
    return response.data;
  }

  async getRecipeByIngredients(recipeId: string) {
    appAssert(recipeId, BAD_REQUEST, "Invalid ingredients");
    // const sponnerApiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
    const sponnerApiUrl = getRecipeInformationUrl(recipeId);
    const respones = await axios.get(sponnerApiUrl);
    return respones.data;
  }

  async updateUserDetails(userId: ObjectId, data: TUserDetails) {
    appAssert(userId, BAD_REQUEST, "Invalid userId");
    appAssert(data, BAD_REQUEST, "Invalid data");
    const targetDailyCalories = calculateTargetCalories(data);
    const updatedData = { ...data, targetDailyCalories };
    await this.caloriesDetailsRepository.createCaloriesDetails(userId, updatedData);
  }
  async addMeal(userId: ObjectId, foodItems: IFoodItem, mealType: string) {
    appAssert(foodItems, BAD_REQUEST, "Invalid foodItems");
    appAssert(mealType, BAD_REQUEST, "Invalid mealType");
    await this.caloriesDetailsRepository.addMeal(userId, foodItems, mealType);
  }
}
