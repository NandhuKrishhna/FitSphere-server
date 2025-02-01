import { Router } from "express"
import { UserController } from "../../controllers/auth/UserController"
import { Container } from "typedi"; 
import { TokenHandler } from "../../middleware/auth/verifyToken";
const authRouter = Router()
const userController = Container.get(UserController);
const tokenHandler = new TokenHandler();
const verifyToken = tokenHandler.verifyToken
authRouter.post("/signup" , userController.registerHandler); 
authRouter.post("/login" , userController.loginHandler);
authRouter.get("/refresh" , userController.refreshHandler);
authRouter.get("/logout" , userController.logoutHandler);
// verify email{otp} after user signup 
authRouter.post("/verify-email" , userController.otpVerifyHandler);
// authRouter.get("/verify/email/:code" , userController.verifyEmailHandler);

{/* Forgot password routes*/}
authRouter.post("/forgot-password",userController.sendPasswordResetHandler);
authRouter.post("/verify/reset-password/otp",userController.verifyResetPasswordCode);
authRouter.post("/reset/new-password",userController.resetPasswordHandler);
authRouter.get("/resend-otp",verifyToken, userController.resendPasswordHandler);
authRouter.get("/check-auth",verifyToken, userController.checkAuthHandler);
export default authRouter;

