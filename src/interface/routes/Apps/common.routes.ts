import { Router } from "express";
import Container from "typedi";
import { DoctorController } from "../../controllers/doctor/DoctorController";
import { AppController } from "../../controllers/Feat/AppController";

const commonRouter = Router();
const doctorController = Container.get(DoctorController);
const appController = Container.get(AppController)
commonRouter.patch("/update-password", doctorController.updatePasswordHandler);

commonRouter.get("/get-all-notification", appController.getNotificationsHandler);
commonRouter.post("/mark-as-read", appController.markAsReadNotificationHandler);
commonRouter.get("/get-reviews/:doctorId", appController.fetchReviewsAndRatingHandler);
commonRouter.get("/get-all-ratings", appController.getAllRatingsHandler);
commonRouter.get("/get-all-transactions", appController.getAllTransactionsHandler);
commonRouter.get("/get-transaction-history", appController.fetchTransactionHandler);
export default commonRouter;
