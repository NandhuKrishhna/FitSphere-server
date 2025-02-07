import { Router } from "express";
import Container from "typedi";
import { DoctorController } from "../../controllers/doctor/DoctorController";
import verifyTokenMiddleware from "../../middleware/doctor/doctorAuth";
const doctorRoutes = Router();



const doctorController = Container.get(DoctorController);
//register as doctor
doctorRoutes.post("/signup", doctorController.registerHandler);
doctorRoutes.post("/register-as-doctor", doctorController.registerAsDoctorHandler);
doctorRoutes.get("/verify-email/:code", doctorController.verifyEmailHandler);

export default doctorRoutes
