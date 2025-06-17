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
exports.DoctorFeatUseCase = void 0;
const typedi_1 = require("typedi");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
const ISlotRepository_1 = require("../repositories/ISlotRepository");
const IAppointmentRepository_1 = require("../repositories/IAppointmentRepository");
const IConversationRepository_1 = require("../repositories/IConversationRepository");
const doctorHelper_1 = require("../../shared/utils/doctorHelper");
const IDoctorReposirtory_1 = require("../repositories/IDoctorReposirtory");
let DoctorFeatUseCase = class DoctorFeatUseCase {
    constructor(_slotRepository, _appointmentRepository, conversationRepository, _doctorRepository) {
        this._slotRepository = _slotRepository;
        this._appointmentRepository = _appointmentRepository;
        this.conversationRepository = conversationRepository;
        this._doctorRepository = _doctorRepository;
    }
    addSlots(doctorId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingSlots = yield this._slotRepository.findSlotDetails(doctorId, payload.startTime, payload.endTime, payload.date);
            (0, appAssert_1.default)(!existingSlots, http_1.CONFLICT, "Slot already exists");
            const { startTime, endTime } = payload;
            (0, appAssert_1.default)(startTime < endTime, http_1.BAD_REQUEST, "End time must be after start time");
            let type = payload.consultationType === "video" ? "video" /* ConsultationType.Video */ : "audio" /* ConsultationType.Audio */;
            const newSlot = (0, doctorHelper_1.IcreateSlot)(doctorId, startTime, endTime, payload.date, type);
            const newSlotDetails = yield this._slotRepository.createSlot(newSlot);
            return newSlotDetails;
        });
    }
    displayAllSlots(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slots = yield this._slotRepository.findAllActiveSlots(doctorId);
            return slots;
        });
    }
    cancelSlot(doctorId, slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingSlot = yield this._slotRepository.findSlotById(slotId);
            (0, appAssert_1.default)(existingSlot, http_1.BAD_REQUEST, "Slot not found.Or Already cancelled.");
            (0, appAssert_1.default)((existingSlot === null || existingSlot === void 0 ? void 0 : existingSlot.status) !== "cancelled", http_1.UNAUTHORIZED, "Slot has already been cancelled.");
            (0, appAssert_1.default)((existingSlot === null || existingSlot === void 0 ? void 0 : existingSlot.status) !== "booked", http_1.UNAUTHORIZED, "Patient has already booked this slot.");
            yield this._slotRepository.deleteSlot(doctorId, slotId);
        });
    }
    getAllAppointment(userId, queryParams, role) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Doctor Id is required");
            return this._appointmentRepository.findAllAppointmentByUserIdAndRole(userId, queryParams, role);
        });
    }
    getAllUsers(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.conversationRepository.getUsers(userId, role);
            return users;
        });
    }
    getDoctorDetails(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            const doctorDetails = yield this._doctorRepository.findDoctorDetails(userId);
        });
    }
    profilePageDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointments = yield this._appointmentRepository.findAllAppointments(userId);
            const slots = yield this._slotRepository.findAllSlots(userId);
            return {
                appointments,
                slots,
            };
        });
    }
};
exports.DoctorFeatUseCase = DoctorFeatUseCase;
exports.DoctorFeatUseCase = DoctorFeatUseCase = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(ISlotRepository_1.ISlotRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(IAppointmentRepository_1.IAppointmentRepositoryToken)),
    __param(2, (0, typedi_1.Inject)(IConversationRepository_1.IConversationRepositoryToken)),
    __param(3, (0, typedi_1.Inject)(IDoctorReposirtory_1.IDoctorRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], DoctorFeatUseCase);
