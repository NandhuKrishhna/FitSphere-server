import { RequestHandler } from "express";
import { Token } from "typedi";

export interface IUserController {
    registerHandler: RequestHandler;
    otpVerifyHandler: RequestHandler;
    loginHandler: RequestHandler;
    logoutHandler: RequestHandler;
    refreshHandler: RequestHandler;
    verifyEmailHandler: RequestHandler;
    sendPasswordResetHandler: RequestHandler;
    verifyResetPasswordCode: RequestHandler;
    resetPasswordHandler: RequestHandler;
    resendPasswordHandler: RequestHandler;
    googleAuthHandler: RequestHandler;

};

export const IUserControllerToken = new Token<IUserController>();