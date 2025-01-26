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
authRouter.get("/verify/email/:code" , userController.verifyEmailHandler);
authRouter.post("/password/forgot",userController.sendPasswordResetHandler);
authRouter.post("/password/reset",userController.resetPasswordHandler);
authRouter.get("/check-auth",verifyToken, userController.checkAuthHandler);
export default authRouter