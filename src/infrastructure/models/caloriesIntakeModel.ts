import mongoose, { Schema, Document } from "mongoose";
import { ObjectId } from "./UserModel";

interface IFoodItem {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  _id?: ObjectId;
}

export interface ICalorieIntake extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  meals: {
    breakfast: IFoodItem[];
    lunch: IFoodItem[];
    dinner: IFoodItem[];
    snacks: IFoodItem[];
  };
  totalCalories?: number;
  totalProtien?: number;
  totalCarbs?: number;
  totalFats?: number;
}

const FoodItemSchema = new Schema<IFoodItem>({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
});

const CalorieIntakeSchema = new Schema<ICalorieIntake>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
  },
  { timestamps: true }
);
CalorieIntakeSchema.pre<ICalorieIntake>("save", function (next) {
  let total = 0;
  let protien = 0;
  let carbs = 0;
  let fats = 0;

  const mealTypes: (keyof ICalorieIntake["meals"])[] = ["breakfast", "lunch", "dinner", "snacks"];

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
export const CalorieIntakeModel = mongoose.model<ICalorieIntake>("CalorieIntake", CalorieIntakeSchema);
