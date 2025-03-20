import { z } from "zod";

export const userDetailsSchema = z.object({
  age: z.number().min(1, "Age must be at least 1").max(120, "Age must be realistic"),
  gender: z.enum(["male", "female"], { message: "Gender must be either 'male' or 'female'" }),
  height: z.number().min(30, "Height must be at least 30 cm").max(300, "Height must be realistic"),
  weight: z.number().min(10, "Weight must be at least 10 kg").max(500, "Weight must be realistic"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "veryActive"], {
    message: "Invalid activity level",
  }),
  goal: z.enum(["lose", "gain", "maintain"], { message: "Goal must be 'lose', 'gain', or 'maintain'" }),
  targetWeight: z.number().min(10, "Target weight must be at least 10 kg").max(500, "Target weight must be realistic"),
  weeksToGoal: z.number().min(1, "Must be at least 1 week").max(52, "Cannot exceed 52 weeks"),
  targetDailyCalories: z.number().optional(),
});

export const updateUserDetailsSchema = userDetailsSchema.partial()
