import { RequestHandler } from "express";
import { Token } from "typedi";
export interface ICaloriesController {
    addUserHealthDetails: RequestHandler;
    updateUserDetails: RequestHandler;
    getUserHealthDetailsHandler: RequestHandler;
    addMealHandler: RequestHandler;
    getFoodLogsHandler: RequestHandler;
    deleteFoodHandler: RequestHandler;
    searchFoodHandler: RequestHandler;
    editFoodHandler: RequestHandler;
    getWeightLogHandler: RequestHandler;



}
export const ICaloriesControllerToken = new Token<ICaloriesController>();