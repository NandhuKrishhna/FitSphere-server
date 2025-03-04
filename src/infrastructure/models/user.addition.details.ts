import mongoose, { Schema, model, Document } from "mongoose";

export interface IUserDetails extends Document {
  userId: mongoose.Types.ObjectId;
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
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
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
