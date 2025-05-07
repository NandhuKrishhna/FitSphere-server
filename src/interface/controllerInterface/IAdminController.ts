import { Token } from "typedi";
import { RequestHandler } from "express";

export interface IAdminController {
    loginHandler: RequestHandler;
    getAllUsersHandler: RequestHandler;
    getAllDoctorsHandler: RequestHandler;
    logoutHandler: RequestHandler;
    notificationHandler: RequestHandler;
    approveRequestHandler: RequestHandler;
    rejectRequestHandler: RequestHandler;
    unblockUserHandler: RequestHandler;
    blockUserHandler: RequestHandler;
    addingPremiumSubscription: RequestHandler;
    editPremiumSubscription: RequestHandler;
    deletePremiumSubscription: RequestHandler;
    getAllPremiumSubscription: RequestHandler;
    adminDasBoardHandler: RequestHandler;
}

export const IAdminControllerToken = new Token<IAdminController>();