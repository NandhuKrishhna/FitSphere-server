import { Router } from "express";
import Container from "typedi";
import authMiddleware from "../../middleware/auth/authMiddleware";
import { AppController } from "../../controllers/Feat/AppController";

const appRouter = Router();

const appController = Container.get(AppController)
appRouter.get("/doctors/all",authMiddleware(["user"]), appController.displayAllDoctorsHandler)
appRouter.post("/update-profile", authMiddleware(["user"]), appController.updateProfileHandler)
appRouter.post("/doctor/profile", authMiddleware(["user"]), appController.displayAllDoctorsHandler)
appRouter.post("/book/slots", authMiddleware(["user"]), appController.bookSlotHandler)


export default appRouter;