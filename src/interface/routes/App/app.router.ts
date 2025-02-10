import { Router } from "express";
import Container from "typedi";
import { UserController } from "../../controllers/auth/UserController";
import authMiddleware from "../../middleware/auth/authMiddleware";

const appRouter = Router();

const userController = Container.get(UserController)
appRouter.get("/doctors/all", userController.displayAllDoctorsHandler)
appRouter.post("/update-profile", authMiddleware(["user"]), userController.updateProfileHandler)


export default appRouter