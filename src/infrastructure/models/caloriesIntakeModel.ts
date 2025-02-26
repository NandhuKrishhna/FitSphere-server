import mongoose, { Schema } from "mongoose";

interface IFoodItem {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

interface ICalorieIntake extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  meals: {
    breakfast: IFoodItem[];
    lunch: IFoodItem[];
    dinner: IFoodItem[];
    snacks: IFoodItem[];
  };
  totalCalories: number;
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
    date: { type: Date, required: true, default: Date.now },
    meals: {
      breakfast: [FoodItemSchema],
      lunch: [FoodItemSchema],
      dinner: [FoodItemSchema],
      snacks: [FoodItemSchema],
    },
    totalCalories: { type: Number, required: true },
  },
  { timestamps: true }
);

export const CalorieIntake = mongoose.model<ICalorieIntake>("CalorieIntake", CalorieIntakeSchema);
