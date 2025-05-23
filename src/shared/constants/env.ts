import dotenv from 'dotenv';
dotenv.config();
const getEnv = (key: string, defaltvalue?: string): string => {
  const value = process.env[key] || defaltvalue;

  if (value === undefined) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
};

export const MONGODB_URL = getEnv("MONGODB_URL");
export const PORT = getEnv("PORT");
export const NODE_ENV = getEnv("NODE_ENV");
export const APP_ORIGIN = getEnv("APP_ORIGIN");
console.log("APP_ORIGIN:", APP_ORIGIN);
export const JWT_SECRET = getEnv("JWT_SECRET");
export const SMTP_USER = getEnv("SMTP_USER");
export const SMTP_PASS = getEnv("SMTP_PASS");
export const SENDER_EMAIL = getEnv("SENDER_EMAIL");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
export const RESEND_API_KEY = getEnv("RESEND_API_KEY");
export const EMAIL_SENDER = getEnv("EMAIL_SENDER");
export const SESSION_SECRET = getEnv("SESSION_SECRET");
export const CLOUDINARY_CLOUD_NAME = getEnv("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = getEnv("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = getEnv("CLOUDINARY_API_SECRET");
export const RAZORPAY_KEY_ID = getEnv("RAZORPAY_KEY_ID");
export const RAZORPAY_KEY_SECRET = getEnv("RAZORPAY_KEY_SECRET");
export const CURRENCY = getEnv("CURRENCY");
export const SPOONACULAR_API_KEY = getEnv("SPOONACULAR_API_KEY");
export const HUGGING_FACE_API_KEY = getEnv("HUGGING_FACE_API_KEY");
export const MODEL_ID = getEnv("MODEL_ID");
export const DeepSeek_Api_key = getEnv("DeepSeek_Api_key");
export const USDA_FOODDATA_API_KEY = getEnv("USDA_FOODDATA_API_KEY");
export const NGROK_AUTHTOKEN = getEnv("NGROK_AUTHTOKEN");
export const GOOGLE_CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");
export const GOOGLE_CLIENT_SECRET = getEnv("GOOGLE_CLIENT_SECRET");
export const NODEMAILER_PASSWORD = getEnv("NODEMAILER_PASSWORD");
export const BETTER_STACK_SOURCE_TOKEN = getEnv("BETTER_STACK_SOURCE_TOKEN")