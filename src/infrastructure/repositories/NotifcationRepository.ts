import { Service } from "typedi";
import {
  INotificationRepository,
  INotificationRepositoryToken,
} from "../../application/repositories/INotificationRepository";
import NotificationModel, { INotification } from "../models/notification.models";
import mongoose from "mongoose";
import { ObjectId } from "../models/UserModel";

@Service({ id: INotificationRepositoryToken })
export class NotificationRepository implements INotificationRepository {
  async createNotification(notification: Partial<INotification>): Promise<INotification> {
    const result = await NotificationModel.create(notification);
    return result;
  }

  async getAllNotifications(types: string[]): Promise<any> {
    const result = await NotificationModel.find({
      type: { $in: types },
    })
      .sort({ createdAt: -1 })
      .lean();

    return result;
  }

  async deleteNotification(id: mongoose.Types.ObjectId): Promise<void> {
    await NotificationModel.deleteMany({ userId: id });
  }

  async getAllNotificationById(userId: mongoose.Types.ObjectId, role: string): Promise<INotification[]> {
    const result = await NotificationModel.find({ userId, role })
      .select("type message status metadata read createdAt") 
      .sort({ createdAt: -1 }) 
      .lean() 
      .exec();

    return result;
}



  async markNotificationAsRead(id:ObjectId): Promise<void> {
    await NotificationModel.findByIdAndUpdate({ _id: id }, { $set: { read: true } });
  }
}
