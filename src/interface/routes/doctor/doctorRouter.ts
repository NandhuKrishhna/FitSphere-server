import { Router } from "express";
import { Container } from "typedi";
import { DoctorController } from "../../controllers/doctor/DoctorController";
import { upload } from "../../../infrastructure/config/multer";
import authenticate from "../../middleware/auth/authMiddleware";
import authorizeRoles from "../../middleware/auth/roleBaseAuthentication";
import UserRoleTypes from "../../../shared/constants/UserRole";
import { UserController } from "../../controllers/auth/UserController";

const doctorRoutes = Router();

const doctorController = Container.get(DoctorController);
const authController = Container.get(UserController);

doctorRoutes.post("/signup", doctorController.registerHandler);
doctorRoutes.post("/registration", upload.single("certificate"), doctorController.registerAsDoctorHandler);
doctorRoutes.post("/verify/otp", doctorController.otpVerifyHandler);
doctorRoutes.post("/login", doctorController.doctorLoginHandler);
doctorRoutes.get("/logout", authenticate, authorizeRoles([UserRoleTypes.DOCTOR]), doctorController.logoutHandler);
doctorRoutes.post("/forgot-password", authController.sendPasswordResetHandler);
doctorRoutes.post("/verify/reset-password/otp", authController.verifyResetPasswordCode);
doctorRoutes.post("/reset-password", authController.resetPasswordHandler);
doctorRoutes.post("/resend-otp", authController.resendPasswordHandler);
//TODO impliment later
doctorRoutes.get("/verify-email/:code", doctorController.verifyEmailHandler);

export default doctorRoutes;
