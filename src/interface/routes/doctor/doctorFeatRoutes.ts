import { Router } from "express";
import { Container } from "typedi";
import { ChatController } from "../../controllers/Feat/ChatController";
import { DoctorFeatController } from "../../controllers/doctor/DoctorFeatController";
import { AppController } from "../../controllers/Feat/AppController";

const doctorFeatRouter = Router();

const doctorFeatController = Container.get(DoctorFeatController);
const chatController = Container.get(ChatController);
const appController = Container.get(AppController);

doctorFeatRouter.post("/slot-management", doctorFeatController.slotManagementHandler);
doctorFeatRouter.get("/get-slots", doctorFeatController.displayAllSlotsHandler);
doctorFeatRouter.post("/cancel-slot", doctorFeatController.cancelSlotHandler);
doctorFeatRouter.post("/get/all-appointments", doctorFeatController.getAllAppointmentsHandler);
doctorFeatRouter.get("/get-all-chats", doctorFeatController.getUsersInSideBarHandler);
doctorFeatRouter.post("/get-all-messages", chatController.getMessagesHandler);
doctorFeatRouter.post("/send-message", chatController.sendMessageHandler);
doctorFeatRouter.get("/get-reviews", appController.fetchReviewsAndRatingHandler);

export default doctorFeatRouter;
