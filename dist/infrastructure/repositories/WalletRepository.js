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
Object.defineProperty(exports, "__esModule", { value: true });
const IWalletRepository_1 = require("../../application/repositories/IWalletRepository");
const walletModel_1 = require("../models/walletModel");
const typedi_1 = require("typedi");
const walletTransaction_model_1 = require("../models/walletTransaction.model");
let WalletRepository = class WalletRepository {
    createWallet(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield walletModel_1.WalletModel.create(data);
        });
    }
    increaseBalance(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = yield walletModel_1.WalletModel.findOne({
                    userId: data.userId,
                    role: data.role,
                });
                if (!wallet) {
                    return null;
                }
                if (wallet.status !== "active") {
                    return null;
                }
                wallet.balance += data.amount;
                yield wallet.save();
                if (data.description || data.relatedTransactionId) {
                    const transaction = yield walletTransaction_model_1.WalletTransactionModel.create({
                        walletId: wallet._id,
                        userId: data.userId,
                        role: data.role,
                        type: "credit",
                        amount: data.amount,
                        currency: wallet.currency,
                        status: "success",
                        description: data.description || "Wallet credited",
                        relatedTransactionId: data.relatedTransactionId,
                    });
                }
                else {
                }
                return wallet;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getWalletDetailsById(userId, role, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = "1", limit = "5", sortBy = "createdAt", sortOrder = "desc", search, status, description } = query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const sortDirection = sortOrder === "asc" ? 1 : -1;
            const matchStage = { userId, role };
            const transactionMatch = {};
            if (search) {
                transactionMatch.$or = [
                    { description: { $regex: search, $options: "i" } },
                    { status: { $regex: search, $options: "i" } },
                ];
            }
            if (status)
                transactionMatch.status = status;
            if (description)
                transactionMatch.description = { $regex: description, $options: "i" };
            const walletExists = yield walletModel_1.WalletModel.findOne({ userId, role });
            if (!walletExists) {
                return {
                    wallet: null,
                    transactions: [],
                    page: pageNum,
                    limit: limitNum,
                    total: 0,
                    totalPages: 0,
                };
            }
            const totalTransactions = yield walletTransaction_model_1.WalletTransactionModel.countDocuments(Object.assign(Object.assign(Object.assign({ walletId: walletExists._id }, (search && {
                $or: [
                    { description: { $regex: search, $options: "i" } },
                    { status: { $regex: search, $options: "i" } },
                ],
            })), (status && { status })), (description && { description: { $regex: description, $options: "i" } })));
            const walletDetails = yield walletModel_1.WalletModel.aggregate([
                { $match: matchStage },
                {
                    $lookup: {
                        from: "wallettransactions",
                        localField: "_id",
                        foreignField: "walletId",
                        as: "transactions",
                        pipeline: [
                            { $match: transactionMatch },
                            { $sort: { [sortBy]: sortDirection } },
                            { $skip: (pageNum - 1) * limitNum },
                            { $limit: limitNum },
                        ],
                    },
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        role: 1,
                        balance: 1,
                        currency: 1,
                        status: 1,
                        transactions: 1,
                    },
                },
            ]).exec();
            const totalPages = Math.ceil(totalTransactions / limitNum) || 0;
            return {
                wallet: walletDetails.length > 0
                    ? {
                        balance: walletDetails[0].balance,
                        currency: walletDetails[0].currency,
                        status: walletDetails[0].status,
                    }
                    : null,
                transactions: walletDetails.length > 0 ? walletDetails[0].transactions : [],
                page: pageNum,
                limit: limitNum,
                total: totalTransactions,
                totalPages: totalPages,
            };
        });
    }
    findWalletById(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield walletModel_1.WalletModel.findOne({ userId, role }).lean();
        });
    }
    decreaseBalance(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = yield walletModel_1.WalletModel.findOne({
                    userId: data.userId,
                    role: data.role,
                });
                if (!wallet) {
                    return null;
                }
                if (wallet.status !== "active") {
                    return null;
                }
                if (wallet.balance < data.amount) {
                    return null;
                }
                wallet.balance -= data.amount;
                yield wallet.save();
                if (data.description || data.relatedTransactionId) {
                    const transaction = yield walletTransaction_model_1.WalletTransactionModel.create({
                        walletId: wallet._id,
                        userId: data.userId,
                        role: data.role,
                        type: "debit",
                        amount: data.amount,
                        currency: wallet.currency,
                        status: "success",
                        description: data.description || "Wallet debited",
                        relatedTransactionId: data.relatedTransactionId,
                    });
                }
                else {
                }
                return wallet;
            }
            catch (error) {
                throw error;
            }
        });
    }
    addCompanyBalance(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            yield walletModel_1.WalletModel.updateOne({ role: "Admin" }, { $inc: { balance: amount } });
        });
    }
};
WalletRepository = __decorate([
    (0, typedi_1.Service)(IWalletRepository_1.IWalletRepositoryToken)
], WalletRepository);
exports.default = WalletRepository;
