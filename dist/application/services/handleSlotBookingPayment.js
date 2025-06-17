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
exports.SlotPaymentService = void 0;
const typedi_1 = require("typedi");
const http_1 = require("../../shared/constants/http");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const IAppointmentRepository_1 = require("../repositories/IAppointmentRepository");
const ITransactionRepository_1 = require("../repositories/ITransactionRepository");
const IWalletRepository_1 = require("../repositories/IWalletRepository");
const ISlotRepository_1 = require("../repositories/ISlotRepository");
const sendAppointmentNotifications_1 = require("./sendAppointmentNotifications");
let SlotPaymentService = class SlotPaymentService {
    constructor(_appointmentRepository, __transactionRepository, __slotRespository, __walletRepository, sendAppointmentNotifications) {
        this._appointmentRepository = _appointmentRepository;
        this.__transactionRepository = __transactionRepository;
        this.__slotRespository = __slotRespository;
        this.__walletRepository = __walletRepository;
        this.sendAppointmentNotifications = sendAppointmentNotifications;
    }
    handleSlotBookingPayment(userId, doctorId, doctorName, receiptId, paymentDetails, razorpay_order_id, orderinfo_amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this._appointmentRepository.updatePaymentStatus(receiptId, paymentDetails, "completed");
            (0, appAssert_1.default)(appointment, http_1.BAD_REQUEST, "Appointment details are missing. Please try again.");
            const updatedUserTransaction = yield this.__transactionRepository.updateTransaction({ paymentGatewayId: receiptId }, {
                status: "success",
                paymentGatewayId: paymentDetails.orderId || razorpay_order_id,
            });
            (0, appAssert_1.default)(updatedUserTransaction, http_1.BAD_REQUEST, "Failed to update user transaction.");
            const doctorTransaction = yield this.__transactionRepository.createTransaction({
                from: userId,
                fromModel: "User",
                to: appointment.doctorId || doctorId,
                toModel: "Doctor",
                amount: Number(orderinfo_amount) / 100,
                type: "credit",
                method: "razorpay",
                paymentType: "slot_booking",
                status: "success",
                bookingId: appointment._id,
                paymentGatewayId: paymentDetails.orderId || razorpay_order_id,
                relatedTransactionId: updatedUserTransaction.transactionId,
            });
            const updatedSlot = yield this.__slotRespository.updateSlotById(appointment === null || appointment === void 0 ? void 0 : appointment.slotId, appointment === null || appointment === void 0 ? void 0 : appointment.patientId);
            (0, appAssert_1.default)(updatedSlot, http_1.NOT_FOUND, "Slot details not found");
            yield this.__walletRepository.increaseBalance({
                userId: doctorId || appointment.doctorId,
                role: "Doctor",
                amount: Number(orderinfo_amount) / 100,
                description: "Slot Booking",
                relatedTransactionId: doctorTransaction._id,
            });
            yield this.sendAppointmentNotifications.sendAppointmentNotifications(appointment, doctorName, updatedSlot);
            return { appointment, message: "Payment verified and appointment confirmed" };
        });
    }
};
exports.SlotPaymentService = SlotPaymentService;
exports.SlotPaymentService = SlotPaymentService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(IAppointmentRepository_1.IAppointmentRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(ITransactionRepository_1.ITransactionRepositoryToken)),
    __param(2, (0, typedi_1.Inject)(ISlotRepository_1.ISlotRepositoryToken)),
    __param(3, (0, typedi_1.Inject)(IWalletRepository_1.IWalletRepositoryToken)),
    __param(4, (0, typedi_1.Inject)(() => sendAppointmentNotifications_1.SendAppointmentNotifications)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, sendAppointmentNotifications_1.SendAppointmentNotifications])
], SlotPaymentService);
