import { Router } from "express";
import { Container } from "typedi";
import { AdminController } from "../../controllers/Admin/AdminController";
import authenticate from "../../middleware/auth/authMiddleware";
import authorizeRoles from "../../middleware/auth/roleBaseAuthentication";

const adminRouter = Router();
const adminController = Container.get(AdminController);

adminRouter.post("/login", adminController.loginHandler);
adminRouter.get("/users", authenticate, authorizeRoles(["admin"]), adminController.getAllUsersHandler);
adminRouter.get("/doctors", authenticate, authorizeRoles(["admin"]), adminController.getAllDoctorsHandler);
adminRouter.get("/logout", authenticate, authorizeRoles(["admin"]), adminController.logoutHandler);
adminRouter.get("/notification", authenticate, authorizeRoles(["admin"]), adminController.notificationHandler);
adminRouter.post("/approve-request", authenticate, authorizeRoles(["admin"]), adminController.approveRequestHandler);
adminRouter.post("/reject-request", authenticate, authorizeRoles(["admin"]), adminController.rejectRequestHandler);
adminRouter.get("/doctorDetails", authenticate, authorizeRoles(["admin"]), adminController.getAllDoctorWithDetails);
adminRouter.post("/unblock-user", authenticate, authorizeRoles(["admin"]), adminController.unblockUserHandler);
adminRouter.post("/block-user", authenticate, authorizeRoles(["admin"]), adminController.blockUserHandler);

export default adminRouter;
