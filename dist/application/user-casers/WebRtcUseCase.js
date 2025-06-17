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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRtcUseCase = void 0;
const typedi_1 = require("typedi");
const IAppointmentRepository_1 = require("../repositories/IAppointmentRepository");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
const ISlotRepository_1 = require("../repositories/ISlotRepository");
let WebRtcUseCase = class WebRtcUseCase {
    constructor(_appointmentRepository, _slotRepository) {
        this._appointmentRepository = _appointmentRepository;
        this._slotRepository = _slotRepository;
    }
    ;
    videoMeeting(meetingId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this._appointmentRepository.findAppointmentByMeetingId(meetingId);
            (0, appAssert_1.default)(appointment, http_1.NOT_FOUND, "Invalid meeting ID");
            if (role === "user") {
                (0, appAssert_1.default)(appointment.patientId.equals(userId), http_1.UNAUTHORIZED, "You are not authorized to join this meeting");
            }
            else if (role === "doctor") {
                (0, appAssert_1.default)(appointment.doctorId.equals(userId), http_1.UNAUTHORIZED, "You are not authorized to join this meeting");
            }
            else {
                (0, appAssert_1.default)(false, http_1.UNAUTHORIZED, "Invalid role");
            }
            (0, appAssert_1.default)(appointment.paymentStatus === "completed", http_1.BAD_REQUEST, "Payment is not completed for this appointment");
            const slotDetails = yield this._slotRepository.findSlotById(appointment.slotId);
            (0, appAssert_1.default)(slotDetails, http_1.NOT_FOUND, "Slot details not found");
            const currentTime = new Date();
            const currentISTTime = new Date(currentTime.getTime() + 5.5 * 60 * 60 * 1000);
            const slotStartTime = new Date(slotDetails.startTime);
            const slotEndTime = new Date(slotDetails.endTime);
            (0, appAssert_1.default)(currentISTTime >= slotStartTime && currentISTTime <= slotEndTime, http_1.BAD_REQUEST, "You can only join the meeting during the scheduled time");
            return appointment;
        });
    }
    leavingMeetAndUpdateStatus(meetingId) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(meetingId, http_1.NOT_FOUND, "Meeting id is required. Or invalid meeting id");
            yield this._appointmentRepository.updateMeetingStatus(meetingId);
        });
    }
};
exports.WebRtcUseCase = WebRtcUseCase;
exports.WebRtcUseCase = WebRtcUseCase = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(IAppointmentRepository_1.IAppointmentRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(ISlotRepository_1.ISlotRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object])
], WebRtcUseCase);
