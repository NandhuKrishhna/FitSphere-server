import { RequestHandler } from "express";
import { Token } from "typedi";
export interface IChatController {
    sendMessageHandler: RequestHandler;
    getMessagesHandler: RequestHandler;
    getAllUsersHandler: RequestHandler;
    createConversationHandler: RequestHandler;
    getConversationHandler: RequestHandler;




}
export const IChatControllerToken = new Token<IChatController>();