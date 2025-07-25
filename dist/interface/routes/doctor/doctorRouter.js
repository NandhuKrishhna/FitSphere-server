"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const DoctorController_1 = require("../../controllers/doctor/DoctorController");
const multer_1 = require("../../../infrastructure/config/multer");
const authMiddleware_1 = __importDefault(require("../../middleware/auth/authMiddleware"));
const roleBaseAuthentication_1 = __importDefault(require("../../middleware/auth/roleBaseAuthentication"));
const UserController_1 = require("../../controllers/auth/UserController");
const doctorRoutes = (0, express_1.Router)();
const doctorController = typedi_1.Container.get(DoctorController_1.DoctorController);
const authController = typedi_1.Container.get(UserController_1.UserController);
doctorRoutes.post("/signup", doctorController.registerHandler);
doctorRoutes.post("/registration", multer_1.upload.single("certificate"), doctorController.registerAsDoctorHandler);
doctorRoutes.post("/verify/otp", doctorController.otpVerifyHandler);
doctorRoutes.post("/login", doctorController.doctorLoginHandler);
doctorRoutes.get("/logout", authMiddleware_1.default, (0, roleBaseAuthentication_1.default)(["doctor" /* Role.DOCTOR */]), doctorController.logoutHandler);
doctorRoutes.post("/forgot-password", authController.sendPasswordResetHandler);
doctorRoutes.post("/verify/reset-password/otp", authController.verifyResetPasswordCode);
doctorRoutes.post("/reset-password", authController.resetPasswordHandler);
doctorRoutes.post("/resend-otp", authController.resendPasswordHandler);
doctorRoutes.patch("/update-details", authMiddleware_1.default, (0, roleBaseAuthentication_1.default)(["doctor" /* Role.DOCTOR */]), doctorController.updateDoctorDetailsHandler);
doctorRoutes.get("/verify-email/:code", doctorController.verifyEmailHandler);
exports.default = doctorRoutes;
