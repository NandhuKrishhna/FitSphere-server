import { Service } from "typedi";
import { INotificationRepository, INotificationRepositoryToken } from "../../application/repositories/INotificationRepository";
import NotificationModel from "../models/notification.models";
import { Notification } from "../../domain/entities/Notification";



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
}