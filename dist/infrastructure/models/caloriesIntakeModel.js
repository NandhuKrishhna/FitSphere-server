"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalorieIntakeModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FoodItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
});
const CalorieIntakeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true, default: () => new Date().setUTCHours(0, 0, 0, 0) },
    meals: {
        breakfast: [FoodItemSchema],
        lunch: [FoodItemSchema],
        dinner: [FoodItemSchema],
        snacks: [FoodItemSchema],
    },
    totalCalories: { type: Number, default: 0 },
    totalProtien: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFats: { type: Number, default: 0 },
    requiredCalories: { type: Number, default: 0 },
}, { timestamps: true });
CalorieIntakeSchema.pre("save", function (next) {
    let total = 0;
    let protien = 0;
    let carbs = 0;
    let fats = 0;
    const mealTypes = ["breakfast", "lunch", "dinner", "snacks"];
    mealTypes.forEach((meal) => {
        this.meals[meal].forEach((foodItem) => {
            total += foodItem.calories;
            protien += foodItem.protein || 0;
            carbs += foodItem.carbs || 0;
            fats += foodItem.fats || 0;
        });
    });
    this.totalCalories = total;
    this.totalProtien = protien;
    this.totalCarbs = carbs;
    this.totalFats = fats;
    next();
});
CalorieIntakeSchema.index({ userId: 1, date: 1 }, { unique: true });
exports.CalorieIntakeModel = mongoose_1.default.model("CalorieIntake", CalorieIntakeSchema);
