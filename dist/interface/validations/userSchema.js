"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpVerificationSchema = exports.resetPasswordSchema = exports.verificationCodeSchema = exports.loginSchema = exports.userRegisterSchema = exports.confirmPasswordSchema = exports.userAgentSchema = exports.passwordSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameSchema = zod_1.z.string().min(3, { message: "Name must be at least 3 characters long" });
exports.emailSchema = zod_1.z
    .string()
    .regex(emailRegex, { message: "Invalid email format" });
exports.passwordSchema = zod_1.z.string().min(6, { message: "Password must be at least 6 characters long" });
exports.userAgentSchema = zod_1.z.string().optional();
exports.confirmPasswordSchema = zod_1.z.string().min(6, { message: "Confirm password is required" });
//register schema
exports.userRegisterSchema = zod_1.z
    .object({
    name: nameSchema,
    email: exports.emailSchema,
    password: exports.passwordSchema,
    confirmPassword: exports.confirmPasswordSchema,
    userAgent: exports.userAgentSchema
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
    password: exports.passwordSchema
});
exports.otpVerificationSchema = zod_1.z.object({
    code: zod_1.z.string().min(6, {
        message: "OTP must be at least 6 characters long",
    }),
});
