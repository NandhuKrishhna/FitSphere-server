import { Router } from "express";
import Container from "typedi";
import { AppController } from "../../controllers/Feat/AppController";
import { ChatController } from "../../controllers/Feat/ChatController";
import { PaymentController } from "../../controllers/Feat/PaymentController";

const appRouter = Router();

const appController = Container.get(AppController);
const chatController = Container.get(ChatController);
const paymentController = Container.get(PaymentController);
appRouter.get("/doctors/all", appController.displayAllDoctorsHandler);
appRouter.post("/update-profile", appController.updateProfileHandler);
appRouter.post("/doctor/profile", appController.doctorDetailsHandler);
appRouter.post("/doctor/slots", appController.getSlotsHandler);
appRouter.post("/get-appointments", appController.getAppointmentHandlers);
appRouter.post("/wallet", appController.getWalletHandler);

// chat
appRouter.post("/send-message", chatController.sendMessageHandler);
appRouter.post("/conversation", chatController.getMessagesHandler);
appRouter.get("/get-users", chatController.getAllUsersHandler);

//payment [wallet, transactions, book appointment]
appRouter.post("/book/slots", paymentController.bookAppointment);
appRouter.post("/wallet-payment", paymentController.walletPaymentHandler);
appRouter.post("/verify/payment", paymentController.verifyPaymentHandler);
appRouter.post("/payment-failure", paymentController.abortPaymentHandler);
appRouter.post("/cancel/appointments", paymentController.cancelAppointmentHandler);

appRouter.post("/add-reviews", appController.reviewAndRatingHandler);
appRouter.post("/get-reviews", appController.fetchReviewsAndRatingHandler);
appRouter.get("/get-all-ratings", appController.getAllRatingsHandler);


appRouter.post("/get-all-notification", appController.getNotificationsHandler);  
appRouter.post("/mark-as-read", appController.markAsReadNotificationHandler);  

appRouter.get("/get-all-transactions", appController.getAllTransactionsHandler);

// appRouter.post("/start-conversation", chatController.addUsersInSideBarHandler);

export default appRouter;
