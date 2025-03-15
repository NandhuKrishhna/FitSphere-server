import axios from "axios";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST } from "../../shared/constants/http";
import { Inject, Service } from "typedi";
import { getRecipeByIngredientsUrl, getRecipeInformationUrl } from "../../shared/utils/SponnerApi";
import { DeepSeek_Api_key, USDA_FOODDATA_API_KEY } from "../../shared/constants/env";
import mongoose from "mongoose";
import {
  ICaloriesDetailsRepository,
  ICaloriesDetailsRepositoryToken,
} from "../repositories/ICaloriesDetailsRepository";
import { TUserDetails } from "../../domain/types/calories.Types";
import { calculateTargetCalories } from "../../shared/utils/calorieCalculator";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { USDA_FOODDATA_API_URL } from "../../shared/constants/url";
import { IFoodItem } from "../../infrastructure/models/caloriesIntakeModel";
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

  public async searchFoodForFoodLog(ingredients: string, quantity?: number) {
    appAssert(ingredients, BAD_REQUEST, "Something went wrong. Please try again");

    const response = await axios.get(USDA_FOODDATA_API_URL, {
      params: {
        query: ingredients,
        api_key: USDA_FOODDATA_API_KEY,
      },
    });

    const foods = response.data.foods.map((food: any) => {
      const nutrients = food.foodNutrients.reduce((acc: any, nutrient: any) => {
        if (nutrient.nutrientName.includes("Energy")) {
          acc.calories = quantity ? Math.round((nutrient.value / 100) * quantity) : Math.round(nutrient.value);
        }
        if (nutrient.nutrientName.includes("Protein")) {
          acc.protein = quantity ? Math.round((nutrient.value / 100) * quantity) : Math.round(nutrient.value);
        }
        if (nutrient.nutrientName.includes("Carbohydrate")) {
          acc.carbs = quantity ? Math.round((nutrient.value / 100) * quantity) : Math.round(nutrient.value);
        }
        if (nutrient.nutrientName.includes("Total lipid")) {
          acc.fat = quantity ? Math.round((nutrient.value / 100) * quantity) : Math.round(nutrient.value);
        }
        return acc;
      }, {} as IFoodItem);
    
      return {
        name: food.description,
        quantity: quantity ? `${quantity}g` : "Default Serving",
        ...nutrients,
      };
    });
    

    return foods;
  }

   async editFood(userId :ObjectId, foodId :ObjectId, date :Date, updatedFoodItem :IFoodItem, mealType:string){
    appAssert(userId, BAD_REQUEST, "Please Login to delete food log");
    appAssert(foodId, BAD_REQUEST, "Something went wrong. Please try again");
    await this.caloriesDetailsRepository.editFoodLog(userId, foodId, date, updatedFoodItem, mealType);
   }
}
