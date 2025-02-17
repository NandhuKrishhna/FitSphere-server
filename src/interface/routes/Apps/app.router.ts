import { Router } from "express";
import Container from "typedi";
import { AppController } from "../../controllers/Feat/AppController";
import { ChatController } from "../../controllers/Feat/ChatController";

const appRouter = Router();

const appController = Container.get(AppController);
const chatController = Container.get(ChatController);
appRouter.get("/doctors/all", appController.displayAllDoctorsHandler);
appRouter.post("/update-profile", appController.updateProfileHandler);
appRouter.post("/doctor/profile", appController.doctorDetailsHandler);
appRouter.post("/doctor/slots", appController.getSlotsHandler);
appRouter.post("/book/slots", appController.bookAppointment);
appRouter.post("/verify/payment", appController.verifyPaymentHandler);
appRouter.post("/get-appointments", appController.getAppointmentHandlers);
appRouter.post("/cancel/appointments", appController.cancelAppointmentHandler);
appRouter.post("/wallet", appController.getWalletHandler);
// chat
appRouter.post("/send-message", chatController.sendMessageHandler);
appRouter.get("/get-message", chatController.getMessagesHandler);
appRouter.get("/get-last-message", chatController.getAllUsersHandler);

export default appRouter;
