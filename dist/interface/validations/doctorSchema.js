"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verificationCodeSchema = exports.loginSchema = exports.doctorRegisterSchema = exports.confirmPasswordSchema = exports.userAgentSchema = exports.passwordSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
const nameSchema = zod_1.z
    .string()
    .min(1, { message: "Name is required" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name should only contain letters and spaces" });
exports.emailSchema = zod_1.z.string().email({ message: "Invalid email address" });
exports.passwordSchema = zod_1.z
    .string()
    .min(6, { message: "Password is required" })
    .max(30, { message: "Password must be at most 30 characters long" });
exports.userAgentSchema = zod_1.z.string().optional();
exports.confirmPasswordSchema = zod_1.z.string().min(1, { message: "Confirm password is required" });
//register schema
exports.doctorRegisterSchema = zod_1.z
    .object({
    name: nameSchema,
    email: exports.emailSchema,
    password: exports.passwordSchema,
    confirmPassword: exports.confirmPasswordSchema,
    userAgent: exports.userAgentSchema,
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
//login schema
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: exports.passwordSchema,
    userAgent: exports.userAgentSchema,
});
//verification code schema
exports.verificationCodeSchema = zod_1.z.string().min(1).max(24);
exports.resetPasswordSchema = zod_1.z.object({
    password: exports.passwordSchema,
    verificationCode: exports.verificationCodeSchema,
});
