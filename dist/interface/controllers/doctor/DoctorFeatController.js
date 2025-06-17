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
exports.DoctorFeatController = void 0;
const typedi_1 = require("typedi");
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const http_1 = require("../../../shared/constants/http");
const date_1 = require("../../../shared/utils/date");
const bcrypt_1 = require("../../../shared/utils/bcrypt");
const DoctorFeatUseCase_1 = require("../../../application/user-casers/DoctorFeatUseCase");
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
let DoctorFeatController = class DoctorFeatController {
    constructor(_doctorFeatUseCase) {
        this._doctorFeatUseCase = _doctorFeatUseCase;
        this.slotManagementHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const { slots } = req.body;
            if (Array.isArray(slots) && slots.length > 0) {
                const createdSlots = [];
                for (const slotData of slots) {
                    const payload = {
                        startTime: (0, date_1.convertToISTWithOffset)(slotData.startTime, 5.5),
                        endTime: (0, date_1.convertToISTWithOffset)(slotData.endTime, 5.5),
                        date: (0, date_1.convertToISTWithOffset)(slotData.date, 5.5),
                        consultationType: slotData.consultationType,
                    };
                    const slot = yield this._doctorFeatUseCase.addSlots(userId, payload);
                    createdSlots.push(slot);
                }
                return res.status(http_1.OK).json({
                    success: true,
                    message: `Successfully created ${createdSlots.length} slots`,
                    response: createdSlots,
                });
            }
            else {
                const { startTime, endTime, date, consultationType } = req.body;
                const payload = {
                    startTime: (0, date_1.convertToISTWithOffset)(startTime, 5.5),
                    endTime: (0, date_1.convertToISTWithOffset)(endTime, 5.5),
                    date: (0, date_1.convertToISTWithOffset)(date, 5.5),
                    consultationType,
                };
                const response = yield this._doctorFeatUseCase.addSlots(userId, payload);
                return res.status(http_1.OK).json({
                    success: true,
                    message: "Slot added successfully",
                    response,
                });
            }
        }));
        this.displayAllSlotsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const response = yield this._doctorFeatUseCase.displayAllSlots(userId);
            return res.status(http_1.OK).json({
                success: true,
                response,
            });
        }));
        this.cancelSlotHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const slotId = (0, bcrypt_1.stringToObjectId)(req.body.slotId);
            const { userId } = req;
            yield this._doctorFeatUseCase.cancelSlot(userId, slotId);
            res.status(http_1.OK).json({
                success: true,
                message: "Slot cancelled successfully",
            });
        }));
        this.getAllAppointmentsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId, role } = req;
            const queryParams = req.query;
            const response = yield this._doctorFeatUseCase.getAllAppointment(userId, queryParams, role);
            return res.status(http_1.OK).json(Object.assign({ success: true }, response));
        }));
        this.getUsersInSideBarHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const { role } = req;
            const users = yield this._doctorFeatUseCase.getAllUsers(userId, role);
            res.status(http_1.OK).json({
                success: true,
                message: "Users fetched successfully",
                users,
            });
        }));
        this.getDoctorDetailHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Please login or Invalid DoctorId.");
            const doctorDetails = yield this._doctorFeatUseCase.getDoctorDetails({ userId });
            res.status(http_1.OK).json({
                success: true,
                message: "Doctor Details fetched successfully",
                doctorDetails,
            });
        }));
        this.profilePageDetailsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Missing DoctorId. Try Again or Please Login");
            const profilePageDetails = yield this._doctorFeatUseCase.profilePageDetails(userId);
            return res.status(http_1.OK).json({
                success: true,
                message: "Successfull",
                profilePageDetails,
            });
        }));
    }
};
exports.DoctorFeatController = DoctorFeatController;
exports.DoctorFeatController = DoctorFeatController = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)()),
    __metadata("design:paramtypes", [DoctorFeatUseCase_1.DoctorFeatUseCase])
], DoctorFeatController);
