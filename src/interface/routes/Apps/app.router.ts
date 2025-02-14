import { Router } from "express";
import Container from "typedi";
import authMiddleware from "../../middleware/auth/authMiddleware";
import { AppController } from "../../controllers/Feat/AppController";
import authorizeRoles from "../../middleware/auth/roleBaseAuthentication";

const appRouter = Router();

const appController = Container.get(AppController)
appRouter.get("/doctors/all",authorizeRoles(["user"]) , appController.displayAllDoctorsHandler)
appRouter.post("/update-profile", appController.updateProfileHandler)
appRouter.post("/doctor/profile", appController.doctorDetailsHandler)
appRouter.post("/doctor/slots", appController.getSlotsHandler)
appRouter.post("/book/slots", appController.bookAppointment)
appRouter.post("/verify/payment", appController.verifyPaymentHandler)
appRouter.post("/get-appointments", appController.getAppointmentHandlers)
appRouter.post("/cancel/appointments", appController.cancelAppointmentHandler)
appRouter.post("/wallet", appController.getWalletHandler)


export default appRouter;