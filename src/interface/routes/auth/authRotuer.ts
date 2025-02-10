import { Router } from "express"
import { UserController } from "../../controllers/auth/UserController"
import { Container } from "typedi"; 
import authMiddleware from "../../middleware/auth/authMiddleware";
const authRouter = Router()
const userController = Container.get(UserController);
authRouter.post("/signup" , userController.registerHandler); 
authRouter.post("/login" , userController.loginHandler);
authRouter.get("/refresh" , userController.refreshHandler);
authRouter.get("/logout" , userController.logoutHandler);
// verify email{otp} after user signup 
authRouter.post("/verify-email" , authMiddleware(["user"]), userController.otpVerifyHandler);
// authRouter.get("/verify/email/:code" , userController.verifyEmailHandler);
{/* Forgot password routes*/}
authRouter.post("/forgot-password" ,userController.sendPasswordResetHandler);
authRouter.post("/verify/reset-password/otp" , authMiddleware(["user"]),userController.verifyResetPasswordCode);
authRouter.post("/reset/new-password" , authMiddleware(["user"]),userController.resetPasswordHandler);
authRouter.get("/resend-otp", userController.resendPasswordHandler);
authRouter.get("/check-auth", userController.checkAuthHandler);

// app features 




export default authRouter;

