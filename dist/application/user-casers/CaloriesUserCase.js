"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaloriesUseCase = void 0;
const axios_1 = __importDefault(require("axios"));
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
const typedi_1 = require("typedi");
const env_1 = require("../../shared/constants/env");
const ICaloriesDetailsRepository_1 = require("../repositories/ICaloriesDetailsRepository");
const calorieCalculator_1 = require("../../shared/utils/calorieCalculator");
const url_1 = require("../../shared/constants/url");
let CaloriesUseCase = class CaloriesUseCase {
    constructor(caloriesDetailsRepository) {
        this.caloriesDetailsRepository = caloriesDetailsRepository;
    }
    addUserHealthDetails(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Invalid userId");
            (0, appAssert_1.default)(data, http_1.BAD_REQUEST, "Invalid data");
            const targetDailyCalories = (0, calorieCalculator_1.calculateTargetCalories)(data);
            return yield this.caloriesDetailsRepository.createCaloriesDetails(userId, Object.assign(Object.assign({}, data), { targetDailyCalories }));
        });
    }
    updateUserDetails(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Invalid userId");
            (0, appAssert_1.default)(data, http_1.BAD_REQUEST, "Invalid data");
            const existingUser = yield this.caloriesDetailsRepository.getUserHealthDetails(userId);
            const updatedData = Object.assign(Object.assign({}, existingUser === null || existingUser === void 0 ? void 0 : existingUser.toObject()), data);
            updatedData.targetDailyCalories = (0, calorieCalculator_1.calculateTargetCalories)(updatedData);
            yield this.caloriesDetailsRepository.updateUserDetails(userId, updatedData);
        });
    }
    getUserHealthDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Invalid userId");
            return yield this.caloriesDetailsRepository.getUserHealthDetails(userId);
        });
    }
    addMeal(userId, mealType, foodItems, date) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(foodItems, http_1.BAD_REQUEST, "Invalid foodItems");
            (0, appAssert_1.default)(mealType, http_1.BAD_REQUEST, "Invalid mealType");
            return yield this.caloriesDetailsRepository.addMeal(userId, foodItems, mealType, date);
        });
    }
    //get foodlogs
    getFoodLogs(userId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Invalid userId");
            return yield this.caloriesDetailsRepository.getFoodLogs(userId, date);
        });
    }
    // delete food log by id
    deleteFood(userId, foodId, date, mealType) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Please Login to delete food log");
            (0, appAssert_1.default)(foodId, http_1.BAD_REQUEST, "Something went wrong. Please try again");
            const existingLog = yield this.caloriesDetailsRepository.findFoodLogById(userId, foodId, date, mealType);
            (0, appAssert_1.default)(existingLog, http_1.BAD_REQUEST, "Food log not found");
            console.log(existingLog);
            yield this.caloriesDetailsRepository.deleteFoodLogByFoodId(userId, foodId, date);
        });
    }
    searchFoodForFoodLog(ingredients, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(ingredients, http_1.BAD_REQUEST, "Something went wrong. Please try again");
            const response = yield axios_1.default.get(url_1.USDA_FOODDATA_API_URL, {
                params: {
                    query: ingredients,
                    api_key: env_1.USDA_FOODDATA_API_KEY,
                },
            });
            const foods = response.data.foods.map((food) => {
                const nutrients = food.foodNutrients.reduce((acc, nutrient) => {
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
                        acc.fats = quantity ? Math.round((nutrient.value / 100) * quantity) : Math.round(nutrient.value);
                    }
                    return acc;
                }, {});
                return Object.assign({ name: food.description, quantity: quantity ? `${quantity}g` : "Default Serving" }, nutrients);
            });
            return foods;
        });
    }
    editFood(userId, foodId, date, updatedFoodItem, mealType) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Please Login to delete food log");
            (0, appAssert_1.default)(foodId, http_1.BAD_REQUEST, "Something went wrong. Please try again");
            return yield this.caloriesDetailsRepository.editFoodLog(userId, foodId, date, updatedFoodItem, mealType);
        });
    }
    getWeightLogs(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.caloriesDetailsRepository.getWeightLogsByUserId(userId);
        });
    }
};
exports.CaloriesUseCase = CaloriesUseCase;
exports.CaloriesUseCase = CaloriesUseCase = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(ICaloriesDetailsRepository_1.ICaloriesDetailsRepositoryToken)),
    __metadata("design:paramtypes", [Object])
], CaloriesUseCase);
