"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const typedi_1 = require("typedi");
const INotificationRepository_1 = require("../../application/repositories/INotificationRepository");
const notification_models_1 = __importDefault(require("../models/notification.models"));
let NotificationRepository = class NotificationRepository {
    createNotification(notification) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield notification_models_1.default.create(notification);
            return result;
        });
    }
    getAllNotifications(types) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield notification_models_1.default.find({
                type: { $in: types },
            })
                .sort({ createdAt: -1 })
                .lean();
            return result;
        });
    }
    deleteNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield notification_models_1.default.deleteMany({ userId: id });
        });
    }
    getAllNotificationById(userId, role, queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = "1", limit = "5", sortBy = "createdAt", sortOrder = "desc", startDate, endDate, type, date } = queryParams;
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const skip = (pageNumber - 1) * limitNumber;
            const filter = { userId, role };
            if (type) {
                filter.type = type;
            }
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate)
                    filter.createdAt.$gte = new Date(startDate);
                if (endDate)
                    filter.createdAt.$lte = new Date(endDate);
            }
            if (date) {
                const specificDate = new Date(date);
                const endOfDay = new Date(specificDate);
                endOfDay.setHours(23, 59, 59, 999);
                filter.createdAt = { $gte: specificDate, $lt: endOfDay };
            }
            const totalNotifications = yield notification_models_1.default.countDocuments(filter);
            const totalPages = Math.ceil(totalNotifications / limitNumber);
            const sort = {};
            sort[sortBy] = sortOrder === "asc" ? 1 : -1;
            const notifications = yield notification_models_1.default.find(filter)
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
        });
    }
    markNotificationAsRead(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield notification_models_1.default.findByIdAndUpdate({ _id: id }, { $set: { read: true } });
        });
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = __decorate([
    (0, typedi_1.Service)({ id: INotificationRepository_1.INotificationRepositoryToken })
], NotificationRepository);
