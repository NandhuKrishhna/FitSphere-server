import { RequestHandler } from "express";
import { Token } from "typedi";

export interface IWebRtcController {
    videoMeetingHandler: RequestHandler;
    leavingMeetAndUpdateStatus: RequestHandler;

};
export const IWebRtcControllerToken = new Token<IWebRtcController>();