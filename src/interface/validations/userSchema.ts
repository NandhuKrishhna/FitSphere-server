import { z } from "zod";


const nameSchema = z.string()
  .nonempty({ message: "Name is required" }) 
  .min(3, { message: "Name must be at least 3 characters long" }) 

.regex(/^[a-zA-Z\s]+$/, { message: "Name should only contain letters and spaces" })

export const emailSchema = z.string().email({ message: "Invalid email address" })
export const passwordSchema = z.string()
  .min(6, { message: "Password must be at least 6 characters long" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" })
  .min(1, { message: "Password is required" });
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
  password : passwordSchema,
  verificationCode : verificationCodeSchema
})