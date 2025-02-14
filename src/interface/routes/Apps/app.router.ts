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
appRouter.post("/verify/payment", authMiddleware(["user"]), appController.verifyPaymentHandler)
appRouter.post("/get-appointments", authMiddleware(["user"]), appController.getAppointmentHandlers)
appRouter.post("/cancel/appointments", authMiddleware(["user"]), appController.cancelAppointmentHandler)
appRouter.post("/wallet", authMiddleware(["user"]), appController.getWalletHandler)


export default appRouter;