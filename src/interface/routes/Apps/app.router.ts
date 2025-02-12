import { Router } from "express";
import Container from "typedi";
import authMiddleware from "../../middleware/auth/authMiddleware";
import { AppController } from "../../controllers/Feat/AppController";
import { upload } from "../../../infrastructure/config/multer";

const appRouter = Router();

const appController = Container.get(AppController)
appRouter.get("/doctors/all",authMiddleware(["user"]), appController.displayAllDoctorsHandler)
appRouter.post("/update-profile", authMiddleware(["user"]), appController.updateProfileHandler)
appRouter.post("/doctor/profile", authMiddleware(["user"]), appController.doctorDetailsHandler)
appRouter.post("/doctor/slots", authMiddleware(["user"]), appController.getSlotsHandler)
appRouter.post("/book/slots", authMiddleware(["user"]), appController.bookAppointment)


export default appRouter;