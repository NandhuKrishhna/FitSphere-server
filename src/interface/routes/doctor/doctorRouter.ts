import { Router } from "express";
import { Container } from "typedi";
import { DoctorController } from "../../controllers/doctor/DoctorController";
import { upload } from "../../../infrastructure/config/multer";


const doctorRoutes = Router();

const doctorController = Container.get(DoctorController);
//register as doctor
doctorRoutes.post("/signup", doctorController.registerHandler);
doctorRoutes.post("/registration", upload.single("profilePicture") ,doctorController.registerAsDoctorHandler);
doctorRoutes.post("/verify/otp", doctorController.otpVerifyHandler);
{/*impliment this later for resetting password on clickig some link*/}
doctorRoutes.get("/verify-email/:code", doctorController.verifyEmailHandler);

export default doctorRoutes
