"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipeInformationUrl = exports.getRecipeByIngredientsUrl = void 0;
const env_1 = require("../constants/env");
const http_1 = require("../constants/http");
const appAssert_1 = __importDefault(require("./appAssert"));
const getRecipeByIngredientsUrl = (ingredients) => {
    (0, appAssert_1.default)(ingredients, http_1.BAD_REQUEST, "Invalid ingredients");
    const baseUrl = "https://api.spoonacular.com/recipes/findByIngredients";
    const queryParams = new URLSearchParams({
        ingredients: ingredients,
        number: "5",
        apiKey: env_1.SPOONACULAR_API_KEY,
    });
    return `${baseUrl}?${queryParams.toString()}`;
};
exports.getRecipeByIngredientsUrl = getRecipeByIngredientsUrl;
const getRecipeInformationUrl = (recipeId) => {
    (0, appAssert_1.default)(recipeId, http_1.BAD_REQUEST, "Invalid recipeId");
    return `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${env_1.SPOONACULAR_API_KEY}`;
};
exports.getRecipeInformationUrl = getRecipeInformationUrl;
