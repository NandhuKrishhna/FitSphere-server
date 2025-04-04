import { RequestHandler } from "express";
import { Token } from "typedi";

export interface IAppController {
    displayAllDoctorsHandler: RequestHandler;
    updateProfileHandler: RequestHandler;
    doctorDetailsHandler: RequestHandler;
    getSlotsHandler: RequestHandler;
    getWalletHandler: RequestHandler;
    getNotificationsHandler: RequestHandler;
    reviewAndRatingHandler: RequestHandler;
    fetchReviewsAndRatingHandler: RequestHandler;
    getAllRatingsHandler: RequestHandler;
    markAsReadNotificationHandler: RequestHandler;
    getAllTransactionsHandler: RequestHandler;
    editReviewHandler: RequestHandler;
    deleteReviewHandler: RequestHandler;
    fetchTransactionHandler: RequestHandler;
    getSubscriptionDetailsHandler: RequestHandler;
};
export const IAppControllerToken = new Token<IAppController>();