import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameSchema = z.string().min(3, { message: "Name must be at least 3 characters long" }) 

export const emailSchema = z
  .string()
  .regex(emailRegex, { message: "Invalid email format" });
  export const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters long" })
export const userAgentSchema =  z.string().optional()
export const confirmPasswordSchema =  z.string().min(6, { message: "Confirm password is required" })



//register schema
export const userRegisterSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password:passwordSchema,
    confirmPassword: confirmPasswordSchema,
    userAgent:userAgentSchema
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
  })



  //verification code schema
export const verificationCodeSchema = z.string().min(1).max(24);

export const resetPasswordSchema = z.object({
  password : passwordSchema
})


export const otpVerificationSchema = z.object({
  code: z.string().min(6, {
    message: "OTP must be at least 6 characters long",
  }),
});
