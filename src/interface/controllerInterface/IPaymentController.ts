import { RequestHandler } from "express";
import { Token } from "typedi";
export interface IPaymentController {

    bookAppointment: RequestHandler;
    verifyPaymentHandler: RequestHandler;
    cancelAppointmentHandler: RequestHandler;
    abortPaymentHandler: RequestHandler
    premiumSubscriptionHandler: RequestHandler;
    walletPaymentHandler: RequestHandler;







};
export const IPaymentControllerToken = new Token<IPaymentController>();