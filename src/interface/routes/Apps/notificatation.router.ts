import { Router } from "express";
import Container from "typedi";
import { AppController } from "../../controllers/Feat/AppController";

const notificationRouter = Router();
const notificationController = Container.get(AppController);
notificationRouter.get("/", notificationController.getNotificationsHandler);

export default notificationRouter;
