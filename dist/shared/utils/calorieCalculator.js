"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTargetCalories = void 0;
const calculateTargetCalories = (user) => {
    const caloriesPerKg = 7700;
    const bmr = user.gender === "male"
        ? 88.362 + 13.397 * user.weight + 4.799 * user.height - 5.677 * user.age
        : 447.593 + 9.247 * user.weight + 3.098 * user.height - 4.33 * user.age;
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9,
    };
    const maintenanceCalories = bmr * activityMultipliers[user.activityLevel];
    if (user.goal === "maintain") {
        return Math.round(maintenanceCalories);
    }
    const weightDifference = user.targetWeight - user.weight;
    const totalDays = user.weeksToGoal * 7;
    const calorieChange = (weightDifference * caloriesPerKg) / totalDays;
    return Math.round(maintenanceCalories + calorieChange);
};
exports.calculateTargetCalories = calculateTargetCalories;
