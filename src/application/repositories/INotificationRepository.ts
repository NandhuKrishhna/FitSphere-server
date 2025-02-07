import { Service, Token } from "typedi";
import { Notification } from "../../domain/entities/Notification";
import mongoose from "mongoose";


export interface INotificationRepository {
    createNotification(notification: Notification): Promise<Notification>;
    getAllNotifications():Promise<any>;
    deleteNotification(id:mongoose.Types.ObjectId):Promise<void>
}

export const INotificationRepositoryToken = new Token<INotificationRepository>();