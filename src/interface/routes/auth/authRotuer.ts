import { Router } from "express"
import { UserController } from "../../controllers/auth/UserController"
import { Container } from "typedi"; 
const authRouter = Router()
const userController = Container.get(UserController);
authRouter.post("/register" , userController.registerHandler); 
authRouter.post("/login" , userController.loginHandler);
authRouter.get("/refresh" , userController.refreshHandler);
authRouter.get("/logout" , userController.logoutHandler);
authRouter.get("/email/verify/:code" , userController.verifyEmailHandler);
authRouter.post("/password/forgot",userController.sendPasswordResetHandler);
authRouter.post("/password/reset",userController.resetPasswordHandler);
export default authRouter