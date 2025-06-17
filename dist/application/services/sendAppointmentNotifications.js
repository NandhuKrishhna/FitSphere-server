"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendAppointmentNotifications = void 0;
const typedi_1 = require("typedi");
const IUserRepository_1 = require("../repositories/IUserRepository");
const ISlotRepository_1 = require("../repositories/ISlotRepository");
const INotificationRepository_1 = require("../repositories/INotificationRepository");
const timeConvertor_1 = require("../../shared/utils/timeConvertor");
const socket_io_1 = require("../../infrastructure/config/socket.io");
const emitNotification_1 = require("../../shared/utils/emitNotification");
let SendAppointmentNotifications = class SendAppointmentNotifications {
    constructor(_userRepository, _slotRepository, __notificationRepository) {
        this._userRepository = _userRepository;
        this._slotRepository = _slotRepository;
        this.__notificationRepository = __notificationRepository;
    }
    sendAppointmentNotifications(appointment, doctorName, updatedSlotDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const userDetails = yield this._userRepository.findUserById(appointment.patientId);
            const [doctorNotification, patientNotification] = yield Promise.all([
                this.__notificationRepository.createNotification({
                    userId: appointment.doctorId,
                    role: "doctor" /* Role.DOCTOR */,
                    type: "appointment" /* NotificationType.Appointment */,
                    message: `A new appointment with ${userDetails === null || userDetails === void 0 ? void 0 : userDetails.name}
                 has been scheduled on ${(0, timeConvertor_1.formatDate)((_a = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.date) === null || _a === void 0 ? void 0 : _a.toISOString())}
                 at ${(0, timeConvertor_1.formatToIndianTime)((_b = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.startTime) === null || _b === void 0 ? void 0 : _b.toISOString())}
                  - ${(0, timeConvertor_1.formatToIndianTime)((_c = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.endTime) === null || _c === void 0 ? void 0 : _c.toISOString())}`,
                    metadata: {
                        meetingId: appointment.meetingId,
                        appointMentId: appointment._id,
                    },
                }),
                this.__notificationRepository.createNotification({
                    userId: appointment.patientId,
                    role: "user" /* Role.USER */,
                    type: "appointment" /* NotificationType.Appointment */,
                    message: `Your appointment with ${doctorName}
                 has been scheduled on ${(0, timeConvertor_1.formatDate)((_d = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.date) === null || _d === void 0 ? void 0 : _d.toISOString())}
                 at ${(0, timeConvertor_1.formatToIndianTime)((_e = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.startTime) === null || _e === void 0 ? void 0 : _e.toISOString())}
                  - ${(0, timeConvertor_1.formatToIndianTime)((_f = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.endTime) === null || _f === void 0 ? void 0 : _f.toISOString())}`,
                    metadata: {
                        meetingId: appointment.meetingId,
                        appointMentId: appointment._id,
                    },
                }),
            ]);
            const doctorSocketId = (0, socket_io_1.getReceiverSocketId)(appointment.doctorId.toString());
            const patientSocketId = (0, socket_io_1.getReceiverSocketId)(appointment.patientId.toString());
            (0, emitNotification_1.emitNotification)(doctorSocketId, doctorNotification.message);
            (0, emitNotification_1.emitNotification)(patientSocketId, patientNotification.message);
        });
    }
};
exports.SendAppointmentNotifications = SendAppointmentNotifications;
exports.SendAppointmentNotifications = SendAppointmentNotifications = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(IUserRepository_1.IUserRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(ISlotRepository_1.ISlotRepositoryToken)),
    __param(2, (0, typedi_1.Inject)(INotificationRepository_1.INotificationRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, Object])
], SendAppointmentNotifications);
