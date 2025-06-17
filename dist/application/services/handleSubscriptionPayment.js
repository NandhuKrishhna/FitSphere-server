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
exports.SubscriptionPayment = void 0;
const typedi_1 = require("typedi");
const IPremiumSubscription_1 = require("../repositories/IPremiumSubscription");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
const IUserSubscriptionRepository_1 = require("../repositories/IUserSubscriptionRepository");
const ITransactionRepository_1 = require("../repositories/ITransactionRepository");
const IWalletRepository_1 = require("../repositories/IWalletRepository");
let SubscriptionPayment = class SubscriptionPayment {
    constructor(premiumRepository, userSubscriptionRepository, __transactionRepository, __walletRepository) {
        this.premiumRepository = premiumRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
        this.__transactionRepository = __transactionRepository;
        this.__walletRepository = __walletRepository;
    }
    handleSubscriptionPayment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, subscriptionId, razorpay_order_id, orderinfo_amount, receiptId }) {
            const existingSubscriptionPlanDetails = yield this.premiumRepository.getSubscriptionById(subscriptionId);
            (0, appAssert_1.default)(existingSubscriptionPlanDetails, http_1.NOT_FOUND, "Subscription was not found. Please try another.");
            yield this.userSubscriptionRepository.deleteExistingSubscription({ userId });
            yield this.userSubscriptionRepository.addSubscription({ userId, subscriptionId });
            yield this.__walletRepository.addCompanyBalance(Number(orderinfo_amount));
            //update transacation status;
            const updatedUserTransaction = yield this.__transactionRepository.updateTransaction({ paymentGatewayId: receiptId }, {
                status: "success",
                paymentGatewayId: razorpay_order_id,
            });
            (0, appAssert_1.default)(updatedUserTransaction, http_1.BAD_REQUEST, "Failed to update user transaction.");
            return {
                message: "Subscription added successfully."
            };
        });
    }
};
exports.SubscriptionPayment = SubscriptionPayment;
exports.SubscriptionPayment = SubscriptionPayment = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(IPremiumSubscription_1.IPremiumSubscriptionRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(IUserSubscriptionRepository_1.IUserSubscriptionRepositoryToken)),
    __param(2, (0, typedi_1.Inject)(ITransactionRepository_1.ITransactionRepositoryToken)),
    __param(3, (0, typedi_1.Inject)(IWalletRepository_1.IWalletRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SubscriptionPayment);
{ /*
 handleSubcription flow
   
*/
}
