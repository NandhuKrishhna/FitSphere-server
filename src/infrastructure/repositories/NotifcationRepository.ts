import { Service } from "typedi";
import {
  INotificationRepository,
  INotificationRepositoryToken,
} from "../../application/repositories/INotificationRepository";
import NotificationModel, { INotification } from "../models/notification.models";
import { Notification } from "../../domain/entities/Notification";
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

  async getAllNotificationById(userId: mongoose.Types.ObjectId): Promise<INotification[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await NotificationModel.find({
      userId: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ createdAt: -1 })
      .exec();

    return result;
  }
}
