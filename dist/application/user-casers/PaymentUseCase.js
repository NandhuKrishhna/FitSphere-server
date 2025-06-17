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
exports.PaymentUseCase = void 0;
const typedi_1 = require("typedi");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
const IUserRepository_1 = require("../repositories/IUserRepository");
const IDoctorReposirtory_1 = require("../repositories/IDoctorReposirtory");
const razorypay_1 = require("../../infrastructure/config/razorypay");
const env_1 = require("../../shared/constants/env");
const ISlotRepository_1 = require("../repositories/ISlotRepository");
const IWalletRepository_1 = require("../repositories/IWalletRepository");
const IPremiumSubscription_1 = require("../repositories/IPremiumSubscription");
const IAppointmentRepository_1 = require("../repositories/IAppointmentRepository");
const INotificationRepository_1 = require("../repositories/INotificationRepository");
const ITransactionRepository_1 = require("../repositories/ITransactionRepository");
const uuid_1 = require("uuid");
const socket_io_1 = require("../../infrastructure/config/socket.io");
const timeConvertor_1 = require("../../shared/utils/timeConvertor");
const emitNotification_1 = require("../../shared/utils/emitNotification");
const IUserSubscriptionRepository_1 = require("../repositories/IUserSubscriptionRepository");
const handleSlotBookingPayment_1 = require("../services/handleSlotBookingPayment");
const handleSubscriptionPayment_1 = require("../services/handleSubscriptionPayment");
let PaymentUseCase = class PaymentUseCase {
    constructor(_userRepository, doctorRespository, __slotRespository, _appointmentRepository, __walletRepository, __notificationRepository, _premiumSubscriptionRepository, __transactionRepository, userSubscriptionRepository, __slotPaymentService, __subscriptionService) {
        this._userRepository = _userRepository;
        this.doctorRespository = doctorRespository;
        this.__slotRespository = __slotRespository;
        this._appointmentRepository = _appointmentRepository;
        this.__walletRepository = __walletRepository;
        this.__notificationRepository = __notificationRepository;
        this._premiumSubscriptionRepository = _premiumSubscriptionRepository;
        this.__transactionRepository = __transactionRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
        this.__slotPaymentService = __slotPaymentService;
        this.__subscriptionService = __subscriptionService;
    }
    userAppointment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ doctorId, patientId, slotId, amount }) {
            const patient = yield this._userRepository.findUserById(patientId);
            (0, appAssert_1.default)(patient, http_1.BAD_REQUEST, "Patient not found. Please try again.");
            const doctor = yield this.doctorRespository.findDoctorByID(doctorId);
            (0, appAssert_1.default)(doctor, http_1.BAD_REQUEST, "Doctor not found. Please try again.");
            (0, appAssert_1.default)(doctor.status !== "blocked", http_1.BAD_REQUEST, "Doctor is not active. Please book another doctor");
            const existingSlot = yield this.__slotRespository.findSlotById(slotId);
            (0, appAssert_1.default)(existingSlot, http_1.BAD_REQUEST, "No slots found. Please try another slot.");
            (0, appAssert_1.default)(!existingSlot.patientId, http_1.BAD_REQUEST, "Slot is already booked. Please try another slot.");
            (0, appAssert_1.default)(existingSlot.status === "available", http_1.BAD_REQUEST, "Slot is not available. Please try another slot.");
            const currentTime = new Date();
            const slotStartTime = new Date(existingSlot.startTime);
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istCurrentTime = new Date(currentTime.getTime() + istOffset);
            (0, appAssert_1.default)(slotStartTime > istCurrentTime, http_1.BAD_REQUEST, "Slot is not available. Please try another slot.");
            const shortPatientId = patientId.toString().slice(-6);
            const receiptId = `rct_${shortPatientId}_${Date.now().toString()}`;
            const razorpayOrder = yield razorypay_1.razorpayInstance.orders.create({
                amount: amount * 100,
                currency: env_1.CURRENCY,
                receipt: receiptId,
                payment_capture: true,
            });
            const newAppointmentDetails = yield this._appointmentRepository.createAppointment({
                doctorId,
                patientId,
                slotId,
                consultationType: existingSlot.consultationType,
                date: existingSlot.date,
                amount,
                orderId: razorpayOrder.receipt,
            });
            const transaction = yield this.__transactionRepository.createTransaction({
                from: patientId,
                fromModel: "User",
                to: doctorId,
                toModel: "Doctor",
                amount: amount,
                type: "debit",
                method: "razorpay",
                paymentType: "slot_booking",
                status: "pending",
                paymentGatewayId: razorpayOrder.receipt,
                bookingId: newAppointmentDetails === null || newAppointmentDetails === void 0 ? void 0 : newAppointmentDetails._id,
            });
            return {
                newAppointmentDetails,
                order: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                },
                transactionId: transaction.transactionId,
            };
        });
    }
    verifyPayment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, razorpay_order_id, doctorId, doctorName, paymentType, subscriptionId }) {
            var _b, _c, _d, _e;
            const orderInfo = yield razorypay_1.razorpayInstance.orders.fetch(razorpay_order_id);
            const receiptId = orderInfo.receipt;
            (0, appAssert_1.default)(orderInfo, http_1.BAD_REQUEST, "Unable to fetch order details. Please try again later.");
            (0, appAssert_1.default)(receiptId, http_1.BAD_REQUEST, "Unable to fetch order details. Please try again later.");
            let response;
            //* Slot Payment
            if (orderInfo.status === "paid" && paymentType === "slot_booking") {
                const payments = yield razorypay_1.razorpayInstance.orders.fetchPayments(razorpay_order_id);
                const additionalDetails = {
                    orderId: (_b = payments.items[0]) === null || _b === void 0 ? void 0 : _b.order_id,
                    paymentMethod: (_c = payments.items[0]) === null || _c === void 0 ? void 0 : _c.method,
                    paymentThrough: "Razorpay",
                    description: ((_d = payments.items[0]) === null || _d === void 0 ? void 0 : _d.description) || "",
                    bank: (_e = payments.items[0]) === null || _e === void 0 ? void 0 : _e.bank,
                    meetingId: (0, uuid_1.v4)(),
                };
                response = yield this.__slotPaymentService.handleSlotBookingPayment(userId, doctorId, doctorName, receiptId, additionalDetails, razorpay_order_id, orderInfo.amount);
            }
            if (orderInfo.status === "paid" && paymentType === "subscription") {
                (0, appAssert_1.default)(subscriptionId, http_1.NOT_FOUND, "Subscription Id not found. Please try after some time.");
                const payments = yield razorypay_1.razorpayInstance.orders.fetchPayments(razorpay_order_id);
                response = yield this.__subscriptionService.handleSubscriptionPayment({
                    userId,
                    subscriptionId,
                    razorpay_order_id,
                    orderinfo_amount: orderInfo.amount,
                    receiptId
                });
            }
            return response || { message: undefined };
        });
    }
    cancelAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const appointment = yield this._appointmentRepository.findAppointmentById(appointmentId);
            (0, appAssert_1.default)(appointment, http_1.BAD_REQUEST, "Appointment not found. Please try again.");
            (0, appAssert_1.default)(appointment.status !== "cancelled", http_1.BAD_REQUEST, "Appointment is already cancelled.");
            (0, appAssert_1.default)(appointment.status !== "completed", http_1.BAD_REQUEST, "Appointment is already completed.");
            const details = yield this._appointmentRepository.cancelAppointment(appointmentId);
            (0, appAssert_1.default)(details, http_1.BAD_REQUEST, "Unable to cancel appointment. Please try few minutes later.");
            yield this.__slotRespository.cancelSlotById(details.slotId);
            // Decreasing from the Doctor and Increasing to the Patient
            yield this.__walletRepository.decreaseBalance({
                userId: details.doctorId,
                role: "Doctor",
                amount: details.amount,
                description: "Appointment cancellation refund",
            });
            yield this.__walletRepository.increaseBalance({
                userId: details.patientId,
                role: "User",
                amount: details.amount,
                description: "Appointment cancellation refund",
            });
            yield this.__transactionRepository.createTransaction({
                from: details.doctorId,
                fromModel: "Doctor",
                to: details.patientId,
                toModel: "User",
                amount: Number(details.amount),
                type: "debit",
                method: "wallet",
                paymentType: "cancel_appointment",
                status: "success",
                bookingId: details._id,
            });
            yield this.__transactionRepository.createTransaction({
                from: details.doctorId,
                fromModel: "Doctor",
                to: details.patientId,
                toModel: "User",
                amount: Number(details.amount),
                type: "credit",
                method: "wallet",
                paymentType: "cancel_appointment",
                status: "success",
                bookingId: details._id,
            });
            const doctorDetails = yield this.doctorRespository.findDoctorByID(details.doctorId);
            const userDetails = yield this._userRepository.findUserById(details.patientId);
            const doctorSocketId = (0, socket_io_1.getReceiverSocketId)(details === null || details === void 0 ? void 0 : details.doctorId.toString());
            const patientSocketId = (0, socket_io_1.getReceiverSocketId)(details === null || details === void 0 ? void 0 : details.patientId.toString());
            const doctorMessage = `Your appointment with ${userDetails === null || userDetails === void 0 ? void 0 : userDetails.name} at
                           ${(0, timeConvertor_1.formatDate)((_a = details === null || details === void 0 ? void 0 : details.date) === null || _a === void 0 ? void 0 : _a.toISOString())} has been cancelled.`;
            const patientMessage = `Your appointment with ${doctorDetails === null || doctorDetails === void 0 ? void 0 : doctorDetails.name} has been cancelled.`;
            (0, emitNotification_1.emitNotification)(doctorSocketId, doctorMessage);
            (0, emitNotification_1.emitNotification)(patientSocketId, patientMessage);
            return details;
        });
    }
    abortPayment(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                const orderInfo = yield razorypay_1.razorpayInstance.orders.fetch(orderId);
                const receiptId = orderInfo.receipt;
                let additionalDetails = {
                    orderId: orderId,
                    paymentMethod: "none",
                    paymentThrough: "Razorpay",
                    description: "Payment cancelled or failed",
                    bank: "",
                    meetingId: "",
                };
                let payments = null;
                try {
                    payments = (yield razorypay_1.razorpayInstance.orders.fetchPayments(orderId));
                    if (((_a = payments === null || payments === void 0 ? void 0 : payments.items) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                        additionalDetails = {
                            orderId: ((_b = payments.items[0]) === null || _b === void 0 ? void 0 : _b.order_id) || orderId,
                            paymentMethod: ((_c = payments.items[0]) === null || _c === void 0 ? void 0 : _c.method) || "none",
                            paymentThrough: "Razorpay",
                            description: ((_d = payments.items[0]) === null || _d === void 0 ? void 0 : _d.description) || "Payment cancelled or failed",
                            bank: ((_e = payments.items[0]) === null || _e === void 0 ? void 0 : _e.bank) || "",
                            meetingId: "",
                        };
                    }
                }
                catch (paymentError) {
                }
                ;
                const appointment = yield this._appointmentRepository.updatePaymentStatus(receiptId, additionalDetails, "failed");
                if (appointment) {
                    yield this.__notificationRepository.createNotification({
                        userId: appointment.patientId,
                        role: "user" /* Role.USER */,
                        type: "appointment" /* NotificationType.Appointment */,
                        message: "Your payment was cancelled or failed",
                        status: "pending",
                    });
                    const response = yield this.__transactionRepository.updateTransaction({ paymentGatewayId: receiptId }, {
                        status: "failed",
                        type: "failed",
                        paymentGatewayId: ((_f = payments === null || payments === void 0 ? void 0 : payments.items[0]) === null || _f === void 0 ? void 0 : _f.id) || receiptId,
                    });
                }
                return { success: true, message: "Payment failure recorded successfully" };
            }
            catch (error) {
                return {
                    success: false,
                    message: "Payment failed",
                    note: "Error details logged on server",
                };
            }
        });
    }
    walletPayment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ usecase, type, userId, doctorId, patientId, amount, slotId }) {
            var _b, _c, _d, _e, _f, _g;
            if (usecase === "slot_booking") {
                const patient = yield this._userRepository.findUserById(patientId);
                (0, appAssert_1.default)(patient, http_1.BAD_REQUEST, "Patient not found. Please try again.");
                const wallet = yield this.__walletRepository.findWalletById(userId, "User");
                (0, appAssert_1.default)(wallet, http_1.BAD_REQUEST, "Wallet not found. Please try again");
                (0, appAssert_1.default)(wallet.balance > amount, http_1.BAD_REQUEST, "Insufficient balance.Please choose another payment method.");
                const doctor = yield this.doctorRespository.findDoctorByID(doctorId);
                (0, appAssert_1.default)(doctor, http_1.BAD_REQUEST, "Doctor not found. Please try again.");
                const existingSlot = yield this.__slotRespository.findSlotById(slotId);
                (0, appAssert_1.default)(existingSlot, http_1.BAD_REQUEST, "No slots found. Please try another slot.");
                (0, appAssert_1.default)(!existingSlot.patientId, http_1.BAD_REQUEST, "Slot is already booked. Please try another slot.");
                (0, appAssert_1.default)(existingSlot.status === "available", http_1.BAD_REQUEST, "Slot is not available. Please try another slot.");
                const overlappingAppointment = yield this._appointmentRepository.findOverlappingAppointment(doctorId, existingSlot.startTime, existingSlot.endTime, existingSlot.date);
                (0, appAssert_1.default)(!overlappingAppointment, http_1.BAD_REQUEST, "Slot is already booked. Please try another slot.");
                const newAppointmentDetails = yield this._appointmentRepository.createAppointment({
                    doctorId,
                    patientId,
                    slotId,
                    consultationType: existingSlot.consultationType,
                    date: existingSlot.date,
                    paymentStatus: "completed",
                    amount,
                    status: "scheduled",
                    paymentMethod: "wallet",
                    paymentThrough: "wallet",
                    description: "Slot booking",
                    meetingId: (0, uuid_1.v4)(),
                });
                const doctorTransaction = yield this.__transactionRepository.createTransaction({
                    from: userId,
                    fromModel: "User",
                    to: doctorId,
                    toModel: "Doctor",
                    amount: Number(amount),
                    type: "credit",
                    method: "wallet",
                    paymentType: "slot_booking",
                    status: "success",
                    bookingId: newAppointmentDetails === null || newAppointmentDetails === void 0 ? void 0 : newAppointmentDetails._id,
                    relatedTransactionId: wallet._id,
                });
                //user transaction
                const userTransaction = yield this.__transactionRepository.createTransaction({
                    from: userId,
                    fromModel: "User",
                    to: doctorId,
                    toModel: "Doctor",
                    amount: Number(amount),
                    type: "debit",
                    method: "wallet",
                    paymentType: "slot_booking",
                    status: "success",
                    bookingId: newAppointmentDetails === null || newAppointmentDetails === void 0 ? void 0 : newAppointmentDetails._id,
                    relatedTransactionId: wallet._id,
                });
                const updatedSlotDetails = yield this.__slotRespository.updateSlotById(slotId, patientId);
                yield this.__walletRepository.increaseBalance({
                    userId: doctorId,
                    role: "Doctor",
                    amount: Number(amount),
                    description: "Slot Booking",
                    relatedTransactionId: doctorTransaction._id
                });
                yield this.__walletRepository.decreaseBalance({
                    userId: patientId,
                    role: "User",
                    amount: Number(amount),
                    description: "Slot Booking",
                    relatedTransactionId: userTransaction._id
                });
                try {
                    const [doctorNotification, patientNotification] = yield Promise.all([
                        this.__notificationRepository.createNotification({
                            userId: doctorId,
                            role: "doctor" /* Role.DOCTOR */,
                            type: "appointment" /* NotificationType.Appointment */,
                            message: `A new appointment with ${patient === null || patient === void 0 ? void 0 : patient.name}
             has been scheduled on ${(0, timeConvertor_1.formatDate)((_b = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.date) === null || _b === void 0 ? void 0 : _b.toISOString())}
             at ${(0, timeConvertor_1.formatToIndianTime)((_c = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.startTime) === null || _c === void 0 ? void 0 : _c.toISOString())}
              - ${(0, timeConvertor_1.formatToIndianTime)((_d = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.endTime) === null || _d === void 0 ? void 0 : _d.toISOString())}`,
                            metadata: {
                                meetingId: newAppointmentDetails === null || newAppointmentDetails === void 0 ? void 0 : newAppointmentDetails.meetingId,
                                appointMentId: newAppointmentDetails === null || newAppointmentDetails === void 0 ? void 0 : newAppointmentDetails._id,
                            },
                        }),
                        this.__notificationRepository.createNotification({
                            userId: patientId,
                            role: "user" /* Role.USER */,
                            type: "appointment" /* NotificationType.Appointment */,
                            message: `Your appointment with ${doctor === null || doctor === void 0 ? void 0 : doctor.name}
             has been scheduled on ${(0, timeConvertor_1.formatDate)((_e = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.date) === null || _e === void 0 ? void 0 : _e.toISOString())}
             at ${(0, timeConvertor_1.formatToIndianTime)((_f = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.startTime) === null || _f === void 0 ? void 0 : _f.toISOString())}
              - ${(0, timeConvertor_1.formatToIndianTime)((_g = updatedSlotDetails === null || updatedSlotDetails === void 0 ? void 0 : updatedSlotDetails.endTime) === null || _g === void 0 ? void 0 : _g.toISOString())}`,
                            metadata: {
                                meetingId: newAppointmentDetails === null || newAppointmentDetails === void 0 ? void 0 : newAppointmentDetails.meetingId,
                                appointMentId: newAppointmentDetails === null || newAppointmentDetails === void 0 ? void 0 : newAppointmentDetails._id,
                            },
                        }),
                    ]);
                    const doctorSocketId = (0, socket_io_1.getReceiverSocketId)(doctorId);
                    const patientSocketId = (0, socket_io_1.getReceiverSocketId)(patientId);
                    (0, emitNotification_1.emitNotification)(doctorSocketId, doctorNotification.message);
                    (0, emitNotification_1.emitNotification)(patientSocketId, patientNotification.message);
                }
                catch (error) {
                    console.error("Notification creation failed:", error);
                }
                return newAppointmentDetails;
            }
        });
    }
    buyPremiumSubscription(_a) {
        return __awaiter(this, arguments, void 0, function* ({ subscriptionId, userId }) {
            (0, appAssert_1.default)(subscriptionId, http_1.BAD_REQUEST, "Subscription not found. Please try again.");
            const subscriptionDetails = yield this._premiumSubscriptionRepository.getSubscriptionById(subscriptionId);
            (0, appAssert_1.default)(subscriptionDetails, http_1.BAD_REQUEST, "Subscription not found. Please try again.");
            const userSubscription = yield this.userSubscriptionRepository.getSubscriptionDetails(userId);
            console.log(userSubscription);
            (0, appAssert_1.default)((userSubscription === null || userSubscription === void 0 ? void 0 : userSubscription.subscriptionId) !== subscriptionId, http_1.BAD_REQUEST, `You already have an ${subscriptionDetails.planName} subscription. Please try again later.`);
            const userDetails = yield this._userRepository.findUserById(userId);
            (0, appAssert_1.default)(userDetails, http_1.BAD_REQUEST, "User not found. Please try again.");
            const shortPatientId = userDetails.toString().slice(-6);
            const receiptId = `rct_${shortPatientId}_${Date.now().toString()}`;
            const razorpayOrder = yield razorypay_1.razorpayInstance.orders.create({
                amount: subscriptionDetails.price * 100,
                currency: env_1.CURRENCY,
                receipt: receiptId,
                payment_capture: true,
            });
            const transaction = yield this.__transactionRepository.createTransaction({
                from: userId,
                fromModel: "User",
                amount: subscriptionDetails.price,
                type: "debit",
                method: "razorpay",
                paymentType: "subscription",
                status: "pending",
                paymentGatewayId: razorpayOrder.receipt,
            });
            return {
                order: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    subscriptionId: subscriptionDetails._id,
                },
            };
        });
    }
};
exports.PaymentUseCase = PaymentUseCase;
exports.PaymentUseCase = PaymentUseCase = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(IUserRepository_1.IUserRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(IDoctorReposirtory_1.IDoctorRepositoryToken)),
    __param(2, (0, typedi_1.Inject)(ISlotRepository_1.ISlotRepositoryToken)),
    __param(3, (0, typedi_1.Inject)(IAppointmentRepository_1.IAppointmentRepositoryToken)),
    __param(4, (0, typedi_1.Inject)(IWalletRepository_1.IWalletRepositoryToken)),
    __param(5, (0, typedi_1.Inject)(INotificationRepository_1.INotificationRepositoryToken)),
    __param(6, (0, typedi_1.Inject)(IPremiumSubscription_1.IPremiumSubscriptionRepositoryToken)),
    __param(7, (0, typedi_1.Inject)(ITransactionRepository_1.ITransactionRepositoryToken)),
    __param(8, (0, typedi_1.Inject)(IUserSubscriptionRepository_1.IUserSubscriptionRepositoryToken)),
    __param(9, (0, typedi_1.Inject)(() => handleSlotBookingPayment_1.SlotPaymentService)),
    __param(10, (0, typedi_1.Inject)(() => handleSubscriptionPayment_1.SubscriptionPayment)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, handleSlotBookingPayment_1.SlotPaymentService,
        handleSubscriptionPayment_1.SubscriptionPayment])
], PaymentUseCase);
