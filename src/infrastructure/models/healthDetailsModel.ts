import mongoose, { Schema, Document } from "mongoose";

interface IHealthDetails extends Document {
  userId: mongoose.Types.ObjectId;
  age: number;
  height: number;
  currentWeight: number;
  goal: "maintain" | "bulk" | "lean";
  targetWeight: number;
  activityLevel: "sedentary" | "lightly active" | "moderately active" | "very active";
  dailyCalorieGoal: number;
}

const HealthDetailsSchema = new Schema<IHealthDetails>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: { type: Number, required: true },
    height: { type: Number, required: true },
    currentWeight: { type: Number, required: true },
    goal: { type: String, enum: ["maintain", "bulk", "lean"], required: true },
    targetWeight: { type: Number, required: true },
    activityLevel: {
      type: String,
      enum: ["sedentary", "lightly active", "moderately active", "very active"],
      required: true,
    },
    dailyCalorieGoal: { type: Number, required: true },
  },
  { timestamps: true }
);

export const HealthDetailsModel = mongoose.model<IHealthDetails>("HealthDetails", HealthDetailsSchema);
