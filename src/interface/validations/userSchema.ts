import { z } from "zod";

const nameSchema = z.string().min(1, { message: "Name is required" })
.regex(/^[a-zA-Z\s]+$/, { message: "Name should only contain letters and spaces" })

const emailSchema = z.string().email({ message: "Invalid email address" })
const passwordSchema =  z.string().min(1, { message: "Password is required" })
const userAgentSchema =  z.string().optional()
const confirmPasswordSchema =  z.string().min(1, { message: "Confirm password is required" })




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


  export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    userAgent: userAgentSchema,
  })
