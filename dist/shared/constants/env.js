"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BETTER_STACK_SOURCE_TOKEN = exports.NODEMAILER_PASSWORD = exports.GOOGLE_CLIENT_SECRET = exports.GOOGLE_CLIENT_ID = exports.NGROK_AUTHTOKEN = exports.USDA_FOODDATA_API_KEY = exports.DeepSeek_Api_key = exports.MODEL_ID = exports.HUGGING_FACE_API_KEY = exports.SPOONACULAR_API_KEY = exports.CURRENCY = exports.RAZORPAY_KEY_SECRET = exports.RAZORPAY_KEY_ID = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.CLOUDINARY_CLOUD_NAME = exports.SESSION_SECRET = exports.EMAIL_SENDER = exports.RESEND_API_KEY = exports.JWT_REFRESH_SECRET = exports.SENDER_EMAIL = exports.SMTP_PASS = exports.SMTP_USER = exports.JWT_SECRET = exports.APP_ORIGIN = exports.NODE_ENV = exports.PORT = exports.MONGODB_URL = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getEnv = (key, defaltvalue) => {
    const value = process.env[key] || defaltvalue;
    if (value === undefined) {
        throw new Error(`Missing environment variable ${key}`);
    }
    return value;
};
exports.MONGODB_URL = getEnv("MONGODB_URL");
exports.PORT = getEnv("PORT");
exports.NODE_ENV = getEnv("NODE_ENV");
exports.APP_ORIGIN = getEnv("APP_ORIGIN");
console.log("APP_ORIGIN:", exports.APP_ORIGIN);
exports.JWT_SECRET = getEnv("JWT_SECRET");
exports.SMTP_USER = getEnv("SMTP_USER");
exports.SMTP_PASS = getEnv("SMTP_PASS");
exports.SENDER_EMAIL = getEnv("SENDER_EMAIL");
exports.JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
exports.RESEND_API_KEY = getEnv("RESEND_API_KEY");
exports.EMAIL_SENDER = getEnv("EMAIL_SENDER");
exports.SESSION_SECRET = getEnv("SESSION_SECRET");
exports.CLOUDINARY_CLOUD_NAME = getEnv("CLOUDINARY_CLOUD_NAME");
exports.CLOUDINARY_API_KEY = getEnv("CLOUDINARY_API_KEY");
exports.CLOUDINARY_API_SECRET = getEnv("CLOUDINARY_API_SECRET");
exports.RAZORPAY_KEY_ID = getEnv("RAZORPAY_KEY_ID");
exports.RAZORPAY_KEY_SECRET = getEnv("RAZORPAY_KEY_SECRET");
exports.CURRENCY = getEnv("CURRENCY");
exports.SPOONACULAR_API_KEY = getEnv("SPOONACULAR_API_KEY");
exports.HUGGING_FACE_API_KEY = getEnv("HUGGING_FACE_API_KEY");
exports.MODEL_ID = getEnv("MODEL_ID");
exports.DeepSeek_Api_key = getEnv("DeepSeek_Api_key");
exports.USDA_FOODDATA_API_KEY = getEnv("USDA_FOODDATA_API_KEY");
exports.NGROK_AUTHTOKEN = getEnv("NGROK_AUTHTOKEN");
exports.GOOGLE_CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");
exports.GOOGLE_CLIENT_SECRET = getEnv("GOOGLE_CLIENT_SECRET");
exports.NODEMAILER_PASSWORD = getEnv("NODEMAILER_PASSWORD");
exports.BETTER_STACK_SOURCE_TOKEN = getEnv("BETTER_STACK_SOURCE_TOKEN");
