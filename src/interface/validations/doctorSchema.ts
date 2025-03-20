import { z } from "zod";

const nameSchema = z
  .string()
  .min(1, { message: "Name is required" })
  .regex(/^[a-zA-Z\s]+$/, { message: "Name should only contain letters and spaces" });

export const emailSchema = z.string().email({ message: "Invalid email address" });
export const passwordSchema = z
  .string()
  .min(6, { message: "Password is required" })
  .max(30, { message: "Password must be at most 30 characters long" });

export const userAgentSchema = z.string().optional();
export const confirmPasswordSchema = z.string().min(1, { message: "Confirm password is required" });

//register schema
export const doctorRegisterSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    userAgent: userAgentSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

//login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: userAgentSchema,
});

//verification code schema
export const verificationCodeSchema = z.string().min(1).max(24);

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  verificationCode: verificationCodeSchema,
});
