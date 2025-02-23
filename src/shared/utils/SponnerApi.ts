import { SPOONACULAR_API_KEY } from "../constants/env";
import { BAD_REQUEST } from "../constants/http";
import appAssert from "./appAssert";

export const getRecipeByIngredientsUrl = (ingredients: string) => {
  appAssert(ingredients, BAD_REQUEST, "Invalid ingredients");
  const baseUrl = "https://api.spoonacular.com/recipes/findByIngredients";
  const queryParams = new URLSearchParams({
    ingredients: ingredients,
    number: "5",
    apiKey: SPOONACULAR_API_KEY,
  });
  return `${baseUrl}?${queryParams.toString()}`;
};

export const getRecipeInformationUrl = (recipeId: string) => {
  appAssert(recipeId, BAD_REQUEST, "Invalid recipeId");
  return `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${SPOONACULAR_API_KEY}`;
};
