import { Router } from "express"
import { UserController } from "../../controllers/auth/UserController"
import { Container } from "typedi"; 
const authRouter = Router()
const userController = Container.get(UserController);
authRouter.post("/register" , userController.registerHandler); 
authRouter.post("/login" , userController.loginHandler);
authRouter.get("/refresh" , userController.refreshHandler);
authRouter.get("/logout" , userController.logoutHandler);
export default authRouter