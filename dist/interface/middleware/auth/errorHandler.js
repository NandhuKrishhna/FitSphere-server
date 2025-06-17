"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../../../shared/constants/http");
const zod_1 = require("zod");
const AppError_1 = __importDefault(require("../../../shared/utils/AppError"));
const setAuthCookies_1 = require("../../../shared/utils/setAuthCookies");
const handleZodError = (res, error) => {
    const errors = error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
    }));
    return res.status(http_1.BAD_REQUEST).json({
        status: "fail",
        message: "Validation error",
        errors,
        timestamp: new Date().toISOString(),
    });
};
const handleAppError = (res, error) => {
    return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
        errorCode: error.errorCode,
        timestamp: new Date().toISOString(),
    });
};
const errorHandler = (error, req, res, next) => {
    const errorDetails = {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        headers: req.headers,
        error: {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
        },
    };
    console.log("Error", errorDetails);
    if (req.path === setAuthCookies_1.REFRESH_PATH) {
        (0, setAuthCookies_1.clearAuthCookies)(res);
    }
    if (error instanceof zod_1.z.ZodError) {
        return handleZodError(res, error);
    }
    if (error instanceof AppError_1.default) {
        return handleAppError(res, error);
    }
    res.status(http_1.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Something went wrong. Please try again later.",
        timestamp: new Date().toISOString(),
    });
};
exports.default = errorHandler;
