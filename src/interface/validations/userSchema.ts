import { z } from "zod";

export const userRegisterSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .regex(/^[a-zA-Z\s]+$/, {
        message: "Name should only contain letters and spaces",
      }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" }),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
