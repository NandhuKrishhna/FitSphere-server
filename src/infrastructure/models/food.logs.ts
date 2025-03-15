import { Schema, model, Document } from "mongoose";

export interface IFoodItem {
  name: string;
  quantity: number;
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

const foodItemSchema = new Schema<IFoodItem>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true }, 
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
});

const foodLogSchema = new Schema<IFoodLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: () => new Date().setUTCHours(0, 0, 0, 0) },
  meals: {
    breakfast: [foodItemSchema], 
    lunch: [foodItemSchema],
    dinner: [foodItemSchema],
    snacks: [foodItemSchema],
  },
  totalConsumed: { type: Number, default: 0 },
  targetCalories: { type: Number, required: true },
  remainingCalories: { type: Number, default: 0 },
  isUnder: { type: Boolean, default: true },
});


foodLogSchema.pre<IFoodLog>("save", function (next) {
  let total = 0;
  const mealTypes: (keyof IFoodLog["meals"])[] = ["breakfast", "lunch", "dinner", "snacks"];

  mealTypes.forEach((meal) => {
    this.meals[meal]?.forEach((item) => {
      total += (item.calories / 100) * item.quantity; 
    });
  });

  this.totalConsumed = total;
  this.remainingCalories = this.targetCalories - total;
  this.isUnder = this.remainingCalories >= 0;
  next();
});

export const FoodLogModel = model<IFoodLog>("FoodLog", foodLogSchema);
