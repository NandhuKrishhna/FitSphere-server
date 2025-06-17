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
exports.TransactionRepository = void 0;
const typedi_1 = require("typedi");
const ITransactionRepository_1 = require("../../application/repositories/ITransactionRepository");
const transactionModel_1 = __importDefault(require("../models/transactionModel"));
const mongoose_1 = __importDefault(require("mongoose"));
let TransactionRepository = class TransactionRepository {
    createTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTransaction = yield transactionModel_1.default.create(transaction);
            return newTransaction;
        });
    }
    getTransactionById(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield transactionModel_1.default.findOne({ transactionId }).exec();
            return transaction;
        });
    }
    updateTransaction(query, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedTransaction = yield transactionModel_1.default.findOneAndUpdate(query, { $set: update }, { new: true }).exec();
            return updatedTransaction;
        });
    }
    getAllTransactions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield transactionModel_1.default.find({
                $or: [{ from: userId }, { to: userId }]
            }).exec();
            return transactions;
        });
    }
    fetchAllTransactionById(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, { page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", search, status, doctorName, method, type, } = {}, role) {
            try {
                const objectIdUserId = mongoose_1.default.Types.ObjectId.isValid(userId)
                    ? new mongoose_1.default.Types.ObjectId(userId)
                    : userId;
                const pageNum = parseInt(page, 10) || 1;
                const limitNum = parseInt(limit, 10) || 10;
                const skip = (pageNum - 1) * limitNum;
                const pipeline = [
                    {
                        $match: Object.assign({ $or: [
                                ...(role === "user"
                                    ? [
                                        { from: objectIdUserId, paymentType: { $in: ["slot_booking", "subscription", "failed"] }, type: { $in: ["debit", "failed"] } },
                                        { to: objectIdUserId, paymentType: "cancel_appointment", type: "credit" },
                                        { to: objectIdUserId, paymentType: "refund" }
                                    ]
                                    : []),
                                ...(role === "doctor"
                                    ? [
                                        { to: objectIdUserId, paymentType: "slot_booking", type: "credit" },
                                        { from: objectIdUserId, paymentType: "cancel_appointment", type: "debit" }
                                    ]
                                    : []),
                            ] }, (status ? { status } : {})),
                    },
                    {
                        $lookup: {
                            from: "doctors",
                            localField: "from",
                            foreignField: "_id",
                            as: "fromDoctor",
                            pipeline: [
                                {
                                    $project: {
                                        name: 1,
                                        profilePicture: 1,
                                        email: 1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "from",
                            foreignField: "_id",
                            as: "fromUser",
                            pipeline: [
                                {
                                    $project: {
                                        name: 1,
                                        profilePicture: 1,
                                        email: 1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $lookup: {
                            from: "doctors",
                            localField: "to",
                            foreignField: "_id",
                            as: "toDoctor",
                            pipeline: [
                                {
                                    $project: {
                                        name: 1,
                                        profilePicture: 1,
                                        email: 1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "to",
                            foreignField: "_id",
                            as: "toUser",
                            pipeline: [
                                {
                                    $project: {
                                        name: 1,
                                        profilePicture: 1,
                                        email: 1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $project: {
                            fromDetails: {
                                $cond: [
                                    { $eq: ["$fromModel", "Doctor"] },
                                    { $arrayElemAt: ["$fromDoctor", 0] },
                                    { $arrayElemAt: ["$fromUser", 0] },
                                ],
                            },
                            toDetails: {
                                $cond: [
                                    { $eq: ["$toModel", "Doctor"] },
                                    { $arrayElemAt: ["$toDoctor", 0] },
                                    { $arrayElemAt: ["$toUser", 0] },
                                ],
                            },
                            amount: 1,
                            type: 1,
                            method: 1,
                            status: 1,
                            paymentType: 1,
                            currency: 1,
                            createdAt: 1,
                        },
                    },
                ];
                if (status)
                    pipeline.push({ $match: { status } });
                if (method)
                    pipeline.push({ $match: { method } });
                if (type)
                    pipeline.push({ $match: { type } });
                if (doctorName) {
                    pipeline.push({
                        $match: {
                            $or: [
                                { "fromDetails.name": { $regex: doctorName, $options: "i" } },
                                { "toDetails.name": { $regex: doctorName, $options: "i" } },
                            ],
                        },
                    });
                }
                if (search) {
                    pipeline.push({
                        $match: {
                            $or: [
                                { "fromDetails.name": { $regex: search, $options: "i" } },
                                { "toDetails.name": { $regex: search, $options: "i" } },
                                { "fromDetails.email": { $regex: search, $options: "i" } },
                                { "toDetails.email": { $regex: search, $options: "i" } },
                            ],
                        },
                    });
                }
                const sortOptions = {};
                sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
                pipeline.push({ $sort: sortOptions });
                pipeline.push({
                    $facet: {
                        metadata: [
                            { $count: "total" },
                            { $addFields: { page: pageNum, limit: limitNum } }
                        ],
                        data: [
                            { $skip: skip },
                            { $limit: limitNum }
                        ],
                    },
                });
                const result = yield transactionModel_1.default.aggregate(pipeline).exec();
                if (!result || !result.length) {
                    return {
                        transactions: [],
                        page: pageNum,
                        limit: limitNum,
                        total: 0,
                        totalPages: 0,
                    };
                }
                const { metadata, data } = result[0];
                const total = metadata.length > 0 ? metadata[0].total : 0;
                return {
                    transactions: data,
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                };
            }
            catch (error) {
                console.error('Error in fetchAllTransactionById:', error);
                throw new Error(`Failed to fetch transactions: ${error.message}`);
            }
        });
    }
};
exports.TransactionRepository = TransactionRepository;
exports.TransactionRepository = TransactionRepository = __decorate([
    (0, typedi_1.Service)(ITransactionRepository_1.ITransactionRepositoryToken)
], TransactionRepository);
