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
exports.PaymentController = void 0;
const typedi_1 = require("typedi");
const PaymentUseCase_1 = require("../../../application/user-casers/PaymentUseCase");
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const http_1 = require("../../../shared/constants/http");
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
const bcrypt_1 = require("../../../shared/utils/bcrypt");
const mongoose_1 = __importDefault(require("mongoose"));
let PaymentController = class PaymentController {
    constructor(_paymentUseCase) {
        this._paymentUseCase = _paymentUseCase;
        this.bookAppointment = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { slotId, amount, doctorId, patientId } = req.body;
            const { newAppointmentDetails, order } = yield this._paymentUseCase.userAppointment({
                slotId,
                amount,
                doctorId,
                patientId,
            });
            res.status(http_1.OK).json({
                success: true,
                message: "Appointment booked successfully",
                newAppointmentDetails,
                order,
            });
        }));
        this.verifyPaymentHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { razorpay_order_id, doctorName, paymentType, doctorId } = req.body;
            const subscriptionId = req.body.subscriptionId
                ? new mongoose_1.default.Types.ObjectId(req.body.subscriptionId)
                : undefined;
            (0, appAssert_1.default)(paymentType, http_1.BAD_REQUEST, "Payment Type is Missing.");
            (0, appAssert_1.default)(razorpay_order_id, http_1.BAD_REQUEST, "Missing Razorpay Order ID.");
            const { userId } = req;
            yield this._paymentUseCase.verifyPayment({
                doctorId,
                userId,
                razorpay_order_id,
                doctorName,
                paymentType,
                subscriptionId
            });
            res.status(http_1.OK).json({
                success: true,
                message: "Payment verified successfully",
            });
        }));
        this.cancelAppointmentHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const appointmentId = (0, bcrypt_1.stringToObjectId)(req.body.appointmentId);
            const response = yield this._paymentUseCase.cancelAppointment(appointmentId);
            res.status(http_1.OK).json({
                success: true,
                message: "Appointment cancelled successfully",
                response,
            });
        }));
        this.abortPaymentHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const orderId = req.body.orderId;
            (0, appAssert_1.default)(orderId, http_1.BAD_REQUEST, "Missing");
            const response = yield this._paymentUseCase.abortPayment(orderId);
            res.status(http_1.OK).json({
                success: true,
                message: "Payment failure recorded",
            });
        }));
        this.premiumSubscriptionHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const subscriptionId = (0, bcrypt_1.stringToObjectId)(req.body.subscriptionId);
            const { userId } = req;
            const response = yield this._paymentUseCase.buyPremiumSubscription({ subscriptionId, userId });
            res.status(http_1.CREATED).json({
                success: true,
                response,
            });
        }));
        this.walletPaymentHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const { usecase, type, doctorId, slotId, amount, patientId } = req.body;
            const response = yield this._paymentUseCase.walletPayment({
                userId,
                usecase,
                type,
                doctorId,
                slotId,
                amount,
                patientId,
            });
            let message;
            usecase === "slot_booking"
                ? (message = "Slot booked successfully")
                : (message = "Subscription purchased successfully");
            res.status(http_1.OK).json({
                success: true,
                message: message,
                response,
            });
        }));
    }
};
exports.PaymentController = PaymentController;
exports.PaymentController = PaymentController = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)()),
    __metadata("design:paramtypes", [PaymentUseCase_1.PaymentUseCase])
], PaymentController);
