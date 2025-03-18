import { Token } from "typedi";
import mongoose from "mongoose";
import { INotification } from "../../infrastructure/models/notification.models";
import { ObjectId } from "../../infrastructure/models/UserModel";

export interface INotificationRepository {
  createNotification(notification: Partial<INotification>): Promise<INotification>;
  getAllNotifications(type: string[]): Promise<any>;
  deleteNotification(id: mongoose.Types.ObjectId): Promise<void>;
  getAllNotificationById(id: mongoose.Types.ObjectId, role: string): Promise<INotification[]>;
  markNotificationAsRead(id: ObjectId): Promise<void>;
}

export const INotificationRepositoryToken = new Token<INotificationRepository>();
