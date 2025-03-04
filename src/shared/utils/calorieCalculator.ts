import { IUserDetails } from "../../infrastructure/models/user.addition.details";

export const calculateTargetCalories = (user: IUserDetails): number => {
  let bmr: number;
  if (user.gender === "male") {
    bmr = 88.362 + 13.397 * user.weight + 4.799 * user.height - 5.677 * user.age;
  } else {
    bmr = 447.593 + 9.247 * user.weight + 3.098 * user.height - 4.33 * user.age;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };

  const maintenance = bmr * activityMultipliers[user.activityLevel];

  if (user.goal === "maintain") {
    return Math.round(maintenance);
  }

  const weightDifference = user.targetWeight - user.weight;
  const totalDays = user.weeksToGoal * 7;
  const calorieChange = (weightDifference * 7700) / totalDays;

  return Math.round(maintenance + calorieChange);
};
