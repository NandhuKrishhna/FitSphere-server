import { Token } from "typedi";
import mongoose from "mongoose";
import { INotification } from "../../infrastructure/models/notification.models";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { NotificationQueryParams } from "../../domain/types/queryParams.types";

export interface INotificationRepository {
  createNotification(notification: Partial<INotification>): Promise<INotification>;
  getAllNotifications(type: string[]): Promise<INotification[]>;
  deleteNotification(id: mongoose.Types.ObjectId): Promise<void>;
  getAllNotificationById(id: mongoose.Types.ObjectId, role: string, queryParams: NotificationQueryParams): Promise<{
    notifications: INotification[];
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
  }>;
  markNotificationAsRead(id: ObjectId): Promise<void>;
}

export const INotificationRepositoryToken = new Token<INotificationRepository>();
