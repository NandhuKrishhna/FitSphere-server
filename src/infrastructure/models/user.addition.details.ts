import mongoose, { Schema, model, Document } from "mongoose";
import { WeightLogModel } from "./weightLog.model";
import { calculateTargetCalories } from "../../shared/utils/calorieCalculator";
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


userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("weight") || this.isModified("targetWeight") || this.isModified("activityLevel") || this.isModified("goal") || this.isModified("weeksToGoal")) {
    this.targetDailyCalories = calculateTargetCalories(this);
  }

  if (this.isNew) {
    const existingWeightLog = await WeightLogModel.findOne({ userId: this.userId });

    if (!existingWeightLog) {
      await WeightLogModel.create({
        userId: this.userId,
        date: new Date(),
        weight: this.weight,
      });
    }
  }

  next();
});


export const UserDetailsModel = model<IUserDetails>("UserDetails", userSchema);
