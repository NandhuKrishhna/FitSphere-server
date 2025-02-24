import axios from "axios";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST } from "../../shared/constants/http";
import { Service } from "typedi";
import { getRecipeByIngredientsUrl, getRecipeInformationUrl } from "../../shared/utils/SponnerApi";
import { DeepSeek_Api_key } from "../../shared/constants/env";

@Service()
export class CaloriesUseCase {
  constructor() {}

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
}
