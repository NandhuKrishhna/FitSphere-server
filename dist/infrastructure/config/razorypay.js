"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayInstance = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const env_1 = require("../../shared/constants/env");
exports.razorpayInstance = new razorpay_1.default({
    key_id: env_1.RAZORPAY_KEY_ID,
    key_secret: env_1.RAZORPAY_KEY_SECRET
});
