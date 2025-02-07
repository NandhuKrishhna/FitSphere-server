import { Service } from "typedi";
import { INotificationRepository, INotificationRepositoryToken } from "../../application/repositories/INotificationRepository";
import NotificationModel from "../models/notification.models";
import { Notification } from "../../domain/entities/Notification";
import mongoose from "mongoose";



@Service({id: INotificationRepositoryToken})
export class NotificationRepository implements INotificationRepository {
  async createNotification(notification: Notification): Promise<Notification> {
    const result = await NotificationModel.create(notification);
    return result as Notification
  }

  async getAllNotifications(): Promise<any> {
    const result = await NotificationModel.find({});
    return result 
  }

  async deleteNotification(id: mongoose.Types.ObjectId):Promise<void>{
    await NotificationModel.deleteMany({userId:id})
  }
}