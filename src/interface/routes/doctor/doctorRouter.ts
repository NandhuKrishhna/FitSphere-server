import { Router } from "express";
import { Container } from "typedi";
import { DoctorController } from "../../controllers/DoctorController";


const doctorRoutes = Router();

const doctorController = Container.get(DoctorController);
//register as doctor
doctorRoutes.post("/signup", doctorController.registerHandler);
doctorRoutes.post("/register-as-doctor/:code", doctorController.registerAsDoctorHandler);
doctorRoutes.post("/verify/otp", doctorController.otpVerifyHandler);
doctorRoutes.get("/verify-email/:code", doctorController.verifyEmailHandler);

export default doctorRoutes
