"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERRORS = exports.IcreateOtp = void 0;
exports.IcreateSession = IcreateSession;
const mongoose_1 = __importDefault(require("mongoose"));
const date_1 = require("./date");
const otpGenerator_1 = require("./otpGenerator");
const Otp_1 = require("../../domain/entities/Otp");
const Session_1 = require("../../domain/entities/Session");
//create OTP
const IcreateOtp = (userId, type) => {
    return new Otp_1.Otp(new mongoose_1.default.Types.ObjectId(), userId, (0, otpGenerator_1.generateOTP)(), type, (0, date_1.generateOtpExpiration)());
};
exports.IcreateOtp = IcreateOtp;
//Session
function IcreateSession(userId, role, userAgent, expiresAt) {
    return new Session_1.Session(new mongoose_1.default.Types.ObjectId(), userId, role, expiresAt, new Date(), userAgent);
}
exports.ERRORS = {
    EMAIL_VERIFICATION_REQUIRED: "Please verify your email. A verification code has been sent to your email.",
};
