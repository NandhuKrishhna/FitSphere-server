"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SENDER_EMAIL = exports.SMTP_PASS = exports.SMTP_USER = exports.JWT_SECRET = exports.APP_ORIGIN = exports.NODE_ENV = exports.PORT = exports.MONGODB_URL = void 0;
const getEnv = (key, defaltvalue) => {
    const value = process.env[key] || defaltvalue;
    if (value === undefined) {
        throw new Error(`Missing environment variable ${key}`);
    }
    return value;
};
exports.MONGODB_URL = getEnv('MONGODB_URL');
exports.PORT = getEnv('PORT');
exports.NODE_ENV = getEnv('NODE_ENV');
exports.APP_ORIGIN = getEnv('APP_ORIGIN');
exports.JWT_SECRET = getEnv('JWT_SECRET');
exports.SMTP_USER = getEnv('SMTP_USER');
exports.SMTP_PASS = getEnv('SMTP_PASS');
exports.SENDER_EMAIL = getEnv('SENDER_EMAIL');
