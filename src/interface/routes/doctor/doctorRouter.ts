import { Router } from "express";
import { Container } from "typedi";
import { DoctorController } from "../../controllers/doctor/DoctorController";
import { upload } from "../../../infrastructure/config/multer";
import authenticate from "../../middleware/auth/authMiddleware";
import authorizeRoles from "../../middleware/auth/roleBaseAuthentication";
import { ChatController } from "../../controllers/Feat/ChatController";

const doctorRoutes = Router();

const doctorController = Container.get(DoctorController);
const chatController = Container.get(ChatController);
//register as doctor
doctorRoutes.post("/signup", doctorController.registerHandler);
doctorRoutes.post(
  "/registration",
  authenticate,
  authorizeRoles(["doctor"]),
  upload.single("profilePicture"),
  doctorController.registerAsDoctorHandler
);
doctorRoutes.post("/verify/otp", doctorController.otpVerifyHandler);
doctorRoutes.post("/login", doctorController.doctorLoginHandler);
doctorRoutes.get("/logout", authenticate, authorizeRoles(["doctor"]), doctorController.logoutHandler);

doctorRoutes.post("/slot-management", authenticate, authorizeRoles(["doctor"]), doctorController.slotManagementHandler);
doctorRoutes.get("/get-slots", authenticate, authorizeRoles(["doctor"]), doctorController.displayAllSlotsHandler);
doctorRoutes.post("/cancel-slot", authenticate, authorizeRoles(["doctor"]), doctorController.cancelSlotHandler);
doctorRoutes.post(
  "/get/all-appointments",
  authenticate,
  authorizeRoles(["doctor"]),
  doctorController.getAllAppointmentsHandler
);
doctorRoutes.get("/get-all-chats", authenticate, authorizeRoles(["doctor"]), doctorController.getUsersInSideBarHandler);
doctorRoutes.post("/get-all-messages", authenticate, authorizeRoles(["doctor"]), chatController.getMessagesHandler);
doctorRoutes.post("/send-message", authenticate, authorizeRoles(["doctor"]), chatController.sendMessageHandler);
//TODO impliment later
doctorRoutes.get("/verify-email/:code", doctorController.verifyEmailHandler);

export default doctorRoutes;
