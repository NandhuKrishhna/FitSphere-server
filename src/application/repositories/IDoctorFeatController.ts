import { RequestHandler } from "express";
import { Token } from "typedi";


export interface IDoctorFeatController {
    slotManagementHandler: RequestHandler;
    displayAllSlotsHandler: RequestHandler;
    cancelSlotHandler: RequestHandler;
    getAllAppointmentsHandler: RequestHandler;
    getUsersInSideBarHandler: RequestHandler;
    getDoctorDetailHandler: RequestHandler;
    profilePageDetailsHandler: RequestHandler;




};
export const IDoctorFeatControllerToken = new Token<IDoctorFeatController>();