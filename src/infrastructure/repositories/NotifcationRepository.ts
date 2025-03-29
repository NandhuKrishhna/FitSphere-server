import { Service } from "typedi";
import {
  INotificationRepository,
  INotificationRepositoryToken,
} from "../../application/repositories/INotificationRepository";
import NotificationModel, { INotification } from "../models/notification.models";
import mongoose from "mongoose";
import { ObjectId } from "../models/UserModel";
import { NotificationQueryParams } from "../../domain/types/queryParams.types";

@Service({ id: INotificationRepositoryToken })
export class NotificationRepository implements INotificationRepository {
  async createNotification(notification: Partial<INotification>): Promise<INotification> {
    const result = await NotificationModel.create(notification);
    return result;
  }

  async getAllNotifications(types: string[]): Promise<INotification[]> {
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

  async getAllNotificationById(
    userId: mongoose.Types.ObjectId,
    role: string,
    queryParams: NotificationQueryParams
  ): Promise<{
    notifications: INotification[];
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
  }> {
    const {
      page = "1",
      limit = "5",
      sortBy = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate,
      type,
      date
    } = queryParams;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const filter: any = { userId, role };

    if (type) {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (date) {
      const specificDate = new Date(date);
      const endOfDay = new Date(specificDate);
      endOfDay.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: specificDate, $lt: endOfDay };
    }

    const totalNotifications = await NotificationModel.countDocuments(filter);
    const totalPages = Math.ceil(totalNotifications / limitNumber);
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    const notifications = await NotificationModel.find(filter)
      .select("type userId message status metadata read createdAt")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber)
      .lean()
      .exec();

    return {
      notifications,
      currentPage: pageNumber,
      totalPages,
      totalNotifications,
    };
  }





  async markNotificationAsRead(id: ObjectId): Promise<void> {
    await NotificationModel.findByIdAndUpdate({ _id: id }, { $set: { read: true } });
  }
}
