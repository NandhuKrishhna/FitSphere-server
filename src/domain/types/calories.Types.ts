export type TUserDetails = {
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  goal: "lose" | "gain" | "maintain";
  targetWeight: number;
  weeksToGoal: number;
  targetDailyCalories?: number;
  createdAt?: Date;
  updatedAt?: Date;
};
