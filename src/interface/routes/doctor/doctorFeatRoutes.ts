import { Router } from "express";
import { Container } from "typedi";
import { ChatController } from "../../controllers/Feat/ChatController";
import { DoctorFeatController } from "../../controllers/doctor/DoctorFeatController";

const doctorFeatRouter = Router();

const doctorFeatController = Container.get(DoctorFeatController);
const chatController = Container.get(ChatController);

doctorFeatRouter.post("/slot-management", doctorFeatController.slotManagementHandler);
doctorFeatRouter.get("/get-slots", doctorFeatController.displayAllSlotsHandler);
doctorFeatRouter.post("/cancel-slot", doctorFeatController.cancelSlotHandler);
doctorFeatRouter.post("/get/all-appointments", doctorFeatController.getAllAppointmentsHandler);
doctorFeatRouter.get("/get-all-chats", doctorFeatController.getUsersInSideBarHandler);
doctorFeatRouter.post("/get-all-messages", chatController.getMessagesHandler);
doctorFeatRouter.post("/send-message", chatController.sendMessageHandler);

export default doctorFeatRouter;
