import { Service, Token } from "typedi";
import mongoose from "mongoose";
import { INotification } from "../../infrastructure/models/notification.models";

export interface INotificationRepository {
  createNotification(notification: Partial<INotification>): Promise<INotification>;
  getAllNotifications(): Promise<any>;
  deleteNotification(id: mongoose.Types.ObjectId): Promise<void>;
  getAllNotificationById(id: mongoose.Types.ObjectId): Promise<INotification[]>;
}

export const INotificationRepositoryToken = new Token<INotificationRepository>();
