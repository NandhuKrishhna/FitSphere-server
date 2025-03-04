import { Schema, model, Document } from "mongoose";

export interface IFoodItem {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface IFoodLog extends Document {
  userId: Schema.Types.ObjectId;
  date: Date;
  meals: Record<"breakfast" | "lunch" | "dinner" | "snacks", IFoodItem[]>;
  totalConsumed: number;
  targetCalories: number;
  remainingCalories: number;
  isUnder: boolean;
}

const foodLogSchema = new Schema<IFoodLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: () => new Date().setUTCHours(0, 0, 0, 0) },
  meals: {
    breakfast: [{ type: Object }],
    lunch: [{ type: Object }],
    dinner: [{ type: Object }],
    snacks: [{ type: Object }],
  },
  totalConsumed: { type: Number, default: 0 },
  targetCalories: Number,
  remainingCalories: Number,
  isUnder: Boolean,
});

foodLogSchema.pre<IFoodLog>("save", function (next) {
  let total = 0;
  const mealTypes: (keyof IFoodLog["meals"])[] = ["breakfast", "lunch", "dinner", "snacks"];

  mealTypes.forEach((meal) => {
    this.meals[meal]?.forEach((item) => {
      total += item.calories;
    });
  });

  this.totalConsumed = total;
  this.remainingCalories = this.targetCalories - total;
  this.isUnder = this.remainingCalories >= 0;
  next();
});

export const FoodLog = model<IFoodLog>("FoodLog", foodLogSchema);
