import { Router } from "express";
import Container from "typedi";
import { AppController } from "../../controllers/Feat/AppController";
import { ChatController } from "../../controllers/Feat/ChatController";
import { PaymentController } from "../../controllers/Feat/PaymentController";
import { DoctorFeatController } from "../../controllers/doctor/DoctorFeatController";

const appRouter = Router();
const appController = Container.get(AppController);
const chatController = Container.get(ChatController);
const paymentController = Container.get(PaymentController);
const doctorController = Container.get(DoctorFeatController);

appRouter.get("/doctors/all", appController.displayAllDoctorsHandler);
appRouter.post("/update-profile", appController.updateProfileHandler);
appRouter.post("/doctor/profile", appController.doctorDetailsHandler);
appRouter.post("/doctor/slots", appController.getSlotsHandler);
appRouter.get("/get-appointments", doctorController.getAllAppointmentsHandler);
appRouter.get("/wallet/:userId", appController.getWalletHandler);

// chat
appRouter.post("/send-message", chatController.sendMessageHandler);
appRouter.get("/conversation", chatController.getMessagesHandler);
appRouter.get("/get-users", chatController.getAllUsersHandler);
appRouter.post("/create-conversation", chatController.createConversationHandler)

//payment [wallet, transactions, book appointment]
appRouter.post("/book/slots", paymentController.bookAppointment);
appRouter.post("/wallet-payment", paymentController.walletPaymentHandler);
appRouter.post("/verify/payment", paymentController.verifyPaymentHandler);
appRouter.post("/payment-failure", paymentController.abortPaymentHandler);
appRouter.post("/cancel/appointments", paymentController.cancelAppointmentHandler);
appRouter.post("/add-reviews", appController.reviewAndRatingHandler);
appRouter.patch("/edit-review", appController.editReviewHandler);
appRouter.delete("/delete-review", appController.deleteReviewHandler);

// appRouter.post("/start-conversation", chatController.addUsersInSideBarHandler);

export default appRouter;
