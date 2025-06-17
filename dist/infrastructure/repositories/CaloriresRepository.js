"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.CaloriesRepository = void 0;
const typedi_1 = require("typedi");
const ICaloriesDetailsRepository_1 = require("../../application/repositories/ICaloriesDetailsRepository");
const user_addition_details_1 = require("../models/user.addition.details");
const mongoose_1 = __importDefault(require("mongoose"));
const caloriesIntakeModel_1 = require("../models/caloriesIntakeModel");
const weightLog_model_1 = require("../models/weightLog.model");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
let CaloriesRepository = class CaloriesRepository {
    createCaloriesDetails(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            let calorieIntake = yield caloriesIntakeModel_1.CalorieIntakeModel.findOne({ userId });
            if (!calorieIntake) {
                calorieIntake = new caloriesIntakeModel_1.CalorieIntakeModel({
                    userId,
                    date: today,
                    meals: {
                        breakfast: [],
                        lunch: [],
                        dinner: [],
                        snacks: [],
                    },
                    requiredCalories: data.targetDailyCalories,
                    totalCalories: 0,
                });
                yield calorieIntake.save();
            }
            const user = yield user_addition_details_1.UserDetailsModel.create(Object.assign(Object.assign({}, data), { userId }));
            return user;
        });
    }
    addMeal(userId, foodItem, mealType, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const formattedDate = new Date(date);
            formattedDate.setUTCHours(0, 0, 0, 0);
            let calorieIntake = yield caloriesIntakeModel_1.CalorieIntakeModel.findOne({
                userId,
                date: formattedDate,
            });
            if (!calorieIntake) {
                calorieIntake = new caloriesIntakeModel_1.CalorieIntakeModel({
                    userId,
                    date: formattedDate,
                    meals: {
                        breakfast: [],
                        lunch: [],
                        dinner: [],
                        snacks: [],
                    },
                });
            }
            calorieIntake.meals[mealType].push(foodItem);
            const updatedLog = yield calorieIntake.save();
            return updatedLog;
        });
    }
    getFoodLogs(userId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetDate = date ? new Date(date) : new Date();
            targetDate.setUTCHours(0, 0, 0, 0);
            const foodLog = yield caloriesIntakeModel_1.CalorieIntakeModel.findOne({ userId, date: targetDate });
            return foodLog;
        });
    }
    getUserHealthDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_addition_details_1.UserDetailsModel.findOne({ userId }).select("-password -__v -_id");
            return user;
        });
    }
    findFoodLogById(userId, foodId, date, mealType) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetDate = new Date(date);
            targetDate.setUTCHours(0, 0, 0, 0);
            const pathToMealArray = `meals.${mealType}`;
            const result = yield caloriesIntakeModel_1.CalorieIntakeModel.findOne({
                userId,
                date: targetDate,
                [`${pathToMealArray}._id`]: foodId,
            }, {
                [`${pathToMealArray}.$`]: 1,
            });
            return result;
        });
    }
    deleteFoodLogByFoodId(userId, foodId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetDate = date ? new Date(date) : new Date();
            targetDate.setUTCHours(0, 0, 0, 0);
            const existingLog = yield caloriesIntakeModel_1.CalorieIntakeModel.findOne({ userId, date: targetDate });
            if (!existingLog) {
                (0, appAssert_1.default)(false, http_1.NOT_FOUND, "Food log not found for the given date.");
            }
            const objectIdFoodId = new mongoose_1.default.Types.ObjectId(foodId);
            const updatedDoc = yield caloriesIntakeModel_1.CalorieIntakeModel.findOneAndUpdate({ userId, date: targetDate }, {
                $pull: {
                    "meals.breakfast": { _id: objectIdFoodId },
                    "meals.lunch": { _id: objectIdFoodId },
                    "meals.dinner": { _id: objectIdFoodId },
                    "meals.snacks": { _id: objectIdFoodId },
                },
            }, { new: true });
            if (!updatedDoc) {
                return;
            }
            yield caloriesIntakeModel_1.CalorieIntakeModel.findOneAndUpdate({ userId, date: targetDate }, [
                {
                    $set: {
                        totalCalories: {
                            $sum: [
                                { $sum: "$meals.breakfast.calories" },
                                { $sum: "$meals.lunch.calories" },
                                { $sum: "$meals.dinner.calories" },
                                { $sum: "$meals.snacks.calories" },
                            ],
                        },
                        totalProtien: {
                            $sum: [
                                { $sum: "$meals.breakfast.protein" },
                                { $sum: "$meals.lunch.protein" },
                                { $sum: "$meals.dinner.protein" },
                                { $sum: "$meals.snacks.protein" },
                            ],
                        },
                        totalCarbs: {
                            $sum: [
                                { $sum: "$meals.breakfast.carbs" },
                                { $sum: "$meals.lunch.carbs" },
                                { $sum: "$meals.dinner.carbs" },
                                { $sum: "$meals.snacks.carbs" },
                            ],
                        },
                        totalFats: {
                            $sum: [
                                { $sum: "$meals.breakfast.fats" },
                                { $sum: "$meals.lunch.fats" },
                                { $sum: "$meals.dinner.fats" },
                                { $sum: "$meals.snacks.fats" },
                            ],
                        },
                        requiredCalories: "$requiredCalories",
                    },
                },
            ], { new: true });
        });
    }
    editFoodLog(userId, foodId, date, updatedFoodItem, mealType) {
        return __awaiter(this, void 0, void 0, function* () {
            const formattedDate = new Date(date);
            formattedDate.setUTCHours(0, 0, 0, 0);
            const calorieIntake = yield caloriesIntakeModel_1.CalorieIntakeModel.findOne({ userId, date: formattedDate });
            if (!calorieIntake) {
                throw new Error("Calorie intake record not found for the given date.");
            }
            const mealArray = calorieIntake.meals[mealType];
            if (!mealArray) {
                throw new Error(`Invalid meal type: ${mealType}`);
            }
            const foodIndex = mealArray.findIndex((food) => { var _a; return ((_a = food._id) === null || _a === void 0 ? void 0 : _a.toString()) === foodId.toString(); });
            if (foodIndex === -1) {
                throw new Error(`Food item not found in the meal. FoodId: ${foodId}, MealType: ${mealType}`);
            }
            mealArray[foodIndex] = Object.assign(Object.assign({}, updatedFoodItem), { _id: new mongoose_1.default.Types.ObjectId() });
            yield calorieIntake.save();
            return mealArray[foodIndex]._id;
        });
    }
    getWeightLogsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield weightLog_model_1.WeightLogModel.find({ userId: userId }).lean();
        });
    }
    updateUserDetails(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield user_addition_details_1.UserDetailsModel.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(userId) }, { $set: data }, { new: true, runValidators: true });
        });
    }
};
exports.CaloriesRepository = CaloriesRepository;
exports.CaloriesRepository = CaloriesRepository = __decorate([
    (0, typedi_1.Service)(ICaloriesDetailsRepository_1.ICaloriesDetailsRepositoryToken)
], CaloriesRepository);
