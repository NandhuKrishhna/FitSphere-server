import { Router } from "express";
import Container from "typedi";
import { AppController } from "../../controllers/Feat/AppController";
import { ChatController } from "../../controllers/Feat/ChatController";
import { PaymentController } from "../../controllers/Feat/PaymentController";
import { DoctorFeatController } from "../../controllers/doctor/DoctorFeatController";
import { AdminController } from "../../controllers/Admin/AdminController";
import checkMessageLimit from "../../middleware/auth/chat-message-limit-middleware";

const appRouter = Router();
const appController = Container.get(AppController);
const chatController = Container.get(ChatController);
const paymentController = Container.get(PaymentController);
const subscription = Container.get(AdminController)

appRouter.get("/doctors/all", appController.displayAllDoctorsHandler);
appRouter.post("/update-profile", appController.updateProfileHandler);
appRouter.post("/doctor/profile", appController.doctorDetailsHandler);
appRouter.post("/doctor/slots", appController.getSlotsHandler);
appRouter.get("/wallet/:userId", appController.getWalletHandler);

// chat
appRouter.post("/send-message", checkMessageLimit, chatController.sendMessageHandler);
appRouter.get("/conversation", chatController.getMessagesHandler);
appRouter.get("/get-users", chatController.getAllUsersHandler);
appRouter.post("/create-conversation", chatController.createConversationHandler);
appRouter.get("/get-conversation", chatController.getConversationHandler);

//payment [wallet, transactions, book appointment]
appRouter.post("/book/slots", paymentController.bookAppointment);
appRouter.post("/wallet-payment", paymentController.walletPaymentHandler);
appRouter.post("/verify/payment", paymentController.verifyPaymentHandler);
appRouter.post("/payment-failure", paymentController.abortPaymentHandler);
appRouter.post("/cancel/appointments", paymentController.cancelAppointmentHandler);
appRouter.post("/add-reviews", appController.reviewAndRatingHandler);
appRouter.patch("/edit-review", appController.editReviewHandler);
appRouter.delete("/delete-review", appController.deleteReviewHandler);

appRouter.get("/get-all-subscription-plans", subscription.getAllPremiumSubscription);
appRouter.post("/buy-subscription", paymentController.premiumSubscriptionHandler)
appRouter.get("/get-subscription-details", appController.getSubscriptionDetailsHandler)

// appRouter.post("/start-conversation", chatController.addUsersInSideBarHandler);

export default appRouter;
