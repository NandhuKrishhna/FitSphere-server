"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserDetailsSchema = exports.userDetailsSchema = void 0;
const zod_1 = require("zod");
exports.userDetailsSchema = zod_1.z.object({
    age: zod_1.z.number().min(1, "Age must be at least 1").max(120, "Age must be realistic"),
    gender: zod_1.z.enum(["male", "female"], { message: "Gender must be either 'male' or 'female'" }),
    height: zod_1.z.number().min(30, "Height must be at least 30 cm").max(300, "Height must be realistic"),
    weight: zod_1.z.number().min(10, "Weight must be at least 10 kg").max(500, "Weight must be realistic"),
    activityLevel: zod_1.z.enum(["sedentary", "light", "moderate", "active", "veryActive"], {
        message: "Invalid activity level",
    }),
    goal: zod_1.z.enum(["lose", "gain", "maintain"], { message: "Goal must be 'lose', 'gain', or 'maintain'" }),
    targetWeight: zod_1.z.number().min(10, "Target weight must be at least 10 kg").max(500, "Target weight must be realistic"),
    weeksToGoal: zod_1.z.number().min(1, "Must be at least 1 week").max(52, "Cannot exceed 52 weeks"),
    targetDailyCalories: zod_1.z.number().optional(),
});
exports.updateUserDetailsSchema = exports.userDetailsSchema.partial();
