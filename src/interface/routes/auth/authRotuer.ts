import { Router } from "express";
import { UserController } from "../../controllers/auth/UserController";
import { Container } from "typedi";
const authRouter = Router();
const userController = Container.get(UserController);
authRouter.post("/signup", userController.registerHandler);
authRouter.post("/login", userController.loginHandler);
authRouter.get("/refresh", userController.refreshHandler);
authRouter.get("/logout", userController.logoutHandler);
// verify email{otp} after user signup
authRouter.post("/verify-email", userController.otpVerifyHandler);
// authRouter.get("/verify/email/:code" , userController.verifyEmailHandler);

authRouter.post("/forgot-password", userController.sendPasswordResetHandler);
authRouter.post("/verify/reset-password/otp", userController.verifyResetPasswordCode);
authRouter.post("/reset/new-password", userController.resetPasswordHandler);
authRouter.post("/resend-otp", userController.resendPasswordHandler);
authRouter.get("/check-auth", userController.checkAuthHandler);
authRouter.get("/google", userController.googleAuthHandler);

export default authRouter;
