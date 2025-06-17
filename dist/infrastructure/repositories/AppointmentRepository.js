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
exports.AppointmentRepository = void 0;
const typedi_1 = require("typedi");
const IAppointmentRepository_1 = require("../../application/repositories/IAppointmentRepository");
const mongoose_1 = __importDefault(require("mongoose"));
const appointmentModel_1 = require("../models/appointmentModel");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
let AppointmentRepository = class AppointmentRepository {
    findOverlappingAppointment(doctorId, startTime, endTime, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointments = yield appointmentModel_1.AppointmentModel.findOne({
                doctorId: doctorId,
                date: date,
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
            });
            return appointments;
        });
    }
    createAppointment(appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield appointmentModel_1.AppointmentModel.create(appointment);
                return response;
            }
            catch (err) {
                if (err.code === 11000 && err.message.includes("meetingId")) {
                    (0, appAssert_1.default)(false, http_1.CONFLICT, "Appointment is already being booked. Please wait...");
                }
                return null;
            }
        });
    }
    updatePaymentStatus(id, additionalDetails, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateFields = {
                paymentStatus: status,
                orderId: additionalDetails.orderId,
                paymentMethod: additionalDetails.paymentMethod,
                paymentThrough: additionalDetails.paymentThrough,
                description: additionalDetails.description,
                bank: additionalDetails.bank,
                meetingId: additionalDetails.meetingId,
            };
            if (status === "failed") {
                updateFields.status = "failed";
            }
            const response = yield appointmentModel_1.AppointmentModel.findOneAndUpdate({ orderId: id }, updateFields, { new: true });
            return response;
        });
    }
    findAppointmentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield appointmentModel_1.AppointmentModel.findOne({ _id: id }).exec();
            return response;
        });
    }
    cancelAppointment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield appointmentModel_1.AppointmentModel.findOneAndUpdate({ _id: id }, { $set: { status: "cancelled" } }, { new: true });
            return response;
        });
    }
    findAllAppointmentByUserIdAndRole(userId_1, _a, role_1) {
        return __awaiter(this, arguments, void 0, function* (userId, { page = "1", limit = "10", sortBy = "date", sortOrder = "desc", search, status, consultationType, paymentStatus, }, role) {
            var _b, _c;
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new Error("Invalid user ID");
            }
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const skip = (pageNum - 1) * limitNum;
            const matchCondition = role === "user"
                ? { patientId: new mongoose_1.default.Types.ObjectId(userId) }
                : { doctorId: new mongoose_1.default.Types.ObjectId(userId) };
            const pipeline = [
                { $match: matchCondition },
                {
                    $lookup: {
                        from: "slots",
                        localField: "slotId",
                        foreignField: "_id",
                        as: "slot",
                    },
                },
                { $unwind: { path: "$slot", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: role === "user" ? "doctors" : "users",
                        localField: role === "user" ? "doctorId" : "patientId",
                        foreignField: "_id",
                        as: "otherUser",
                    },
                },
                { $unwind: { path: "$otherUser", preserveNullAndEmptyArrays: true } },
                {
                    $match: Object.assign(Object.assign(Object.assign({}, (status && { status })), (consultationType && { consultationType })), (paymentStatus && { paymentStatus })),
                },
            ];
            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { "otherUser.name": { $regex: search, $options: "i" } },
                            { "otherUser.email": { $regex: search, $options: "i" } },
                            { "slot.startTime": { $regex: search, $options: "i" } },
                            { "slot.endTime": { $regex: search, $options: "i" } },
                        ],
                    },
                });
            }
            // Sorting
            pipeline.push({
                $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
            });
            // Pagination and projection
            pipeline.push({
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limitNum },
                        { $sort: { createdAt: -1 } },
                        {
                            $project: {
                                _id: 1,
                                date: 1,
                                consultationType: 1,
                                status: 1,
                                paymentStatus: 1,
                                amount: 1,
                                meetingId: 1,
                                paymentMethod: 1,
                                paymentThrough: 1,
                                slot: { startTime: 1, endTime: 1 },
                                otherUser: { name: 1, email: 1, profilePicture: 1 },
                            },
                        },
                    ],
                    total: [{ $count: "total" }],
                },
            });
            // Execute aggregation pipeline
            const [result] = yield appointmentModel_1.AppointmentModel.aggregate(pipeline);
            return {
                data: result.data,
                meta: {
                    total: ((_b = result.total[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil((((_c = result.total[0]) === null || _c === void 0 ? void 0 : _c.total) || 0) / limitNum),
                },
            };
        });
    }
    findAppointmentByMeetingId(meetingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield appointmentModel_1.AppointmentModel.findOne({ meetingId: meetingId }).exec();
            return response;
        });
    }
    findAllAppointments(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const details = yield appointmentModel_1.AppointmentModel.aggregate([
                {
                    $match: {
                        doctorId: new mongoose_1.default.Types.ObjectId(userId),
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "patientId",
                        foreignField: "_id",
                        as: "patientDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$patientDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: "slots",
                        localField: "slotId",
                        foreignField: "_id",
                        as: "slotDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$slotDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        date: 1,
                        startTime: "$slotDetails.startTime",
                        endTime: "$slotDetails.endTime",
                        patientName: "$patientDetails.name",
                        patientProfilePic: "$patientDetails.profilePicture",
                    },
                },
            ]);
            return details;
        });
    }
    updateMeetingStatus(meetingId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield appointmentModel_1.AppointmentModel.findOneAndUpdate({ meetingId: meetingId }, { $set: { status: "completed", meetingId: "" } });
        });
    }
};
exports.AppointmentRepository = AppointmentRepository;
exports.AppointmentRepository = AppointmentRepository = __decorate([
    (0, typedi_1.Service)(IAppointmentRepository_1.IAppointmentRepositoryToken)
], AppointmentRepository);
