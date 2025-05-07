import { RequestHandler } from "express";
import { Token } from "typedi";

export interface IDoctorController {
    registerHandler: RequestHandler;
    registerAsDoctorHandler: RequestHandler;
    otpVerifyHandler: RequestHandler;
    doctorLoginHandler: RequestHandler;
    logoutHandler: RequestHandler;
    verifyEmailHandler: RequestHandler;
    updateDoctorDetailsHandler: RequestHandler;
    updatePasswordHandler: RequestHandler;
}

export const IDoctorControllerToken = new Token<IDoctorController>();