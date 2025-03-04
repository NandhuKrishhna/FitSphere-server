import { Schema, model, Document } from "mongoose";

export interface IUserDetails extends Document {
  email: string;
  password: string;
  name: string;
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  goal: "lose" | "gain" | "maintain";
  targetWeight: number;
  weeksToGoal: number;
  targetDailyCalories: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDetails>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    activityLevel: String,
    goal: String,
    targetWeight: Number,
    weeksToGoal: Number,
    targetDailyCalories: Number,
  },
  { timestamps: true }
);

export const UserDetailsModel = model<IUserDetails>("UserDetails", userSchema);
