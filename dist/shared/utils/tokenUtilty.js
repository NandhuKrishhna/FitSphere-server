"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../constants/env");
const generateAccessToken = ({ userId, sessionId }) => {
    return jsonwebtoken_1.default.sign({
        userId: userId.toString(),
        sessionId: sessionId.toString()
    }, env_1.JWT_SECRET, {
        audience: ["user"],
        expiresIn: "15m",
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = ({ sessionId }) => {
    return jsonwebtoken_1.default.sign({ sessionId: sessionId.toString() }, env_1.JWT_REFRESH_SECRET, {
        audience: ["user"],
        expiresIn: "30d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
