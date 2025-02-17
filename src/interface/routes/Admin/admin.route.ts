import { Router } from "express";
import { Container } from "typedi";
import { AdminController } from "../../controllers/Admin/AdminController";

const adminRouter = Router();
const adminController = Container.get(AdminController);

adminRouter.post("/login", adminController.loginHandler);
adminRouter.get("/users", adminController.getAllUsersHandler);
adminRouter.get("/doctors", adminController.getAllDoctorsHandler);
adminRouter.get("/logout", adminController.logoutHandler);
adminRouter.get("/notification", adminController.notificationHandler);
adminRouter.post("/approve-request", adminController.approveRequestHandler);
adminRouter.post("/reject-request", adminController.rejectRequestHandler);
adminRouter.get("/doctorDetails", adminController.getAllDoctorWithDetails);
adminRouter.post("/unblock-user", adminController.unblockUserHandler);
adminRouter.post("/block-user", adminController.blockUserHandler);

export default adminRouter;
