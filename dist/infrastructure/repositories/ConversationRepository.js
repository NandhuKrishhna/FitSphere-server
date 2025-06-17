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
exports.ConversationRepository = void 0;
const IConversationRepository_1 = require("../../application/repositories/IConversationRepository");
const conversationModel_1 = __importDefault(require("../models/conversationModel"));
const typedi_1 = require("typedi");
const DoctorModel_1 = require("../models/DoctorModel");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
let ConversationRepository = class ConversationRepository {
    createConversation(participants) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = new conversationModel_1.default({ participants });
            return yield conversation.save();
        });
    }
    getConversationByParticipants(participants) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield conversationModel_1.default.findOne({
                participants: { $all: participants, $size: participants.length },
            }).lean();
        });
    }
    updateLastMessage(conversationId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield conversationModel_1.default.findOneAndUpdate({ _id: conversationId }, { lastMessage: message }, { new: true });
        });
    }
    getUsers(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield conversationModel_1.default.aggregate([
                {
                    $match: {
                        participants: { $in: [userId] },
                    },
                },
                {
                    $addFields: {
                        participants: {
                            $map: {
                                input: "$participants",
                                as: "participant",
                                in: { $toObjectId: "$$participant" },
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: role === "user" /* Role.USER */ ? "doctors" : "users",
                        localField: "participants",
                        foreignField: "_id",
                        as: "doctorDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$doctorDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $sort: {
                        updatedAt: -1
                    }
                },
                {
                    $project: {
                        "doctorDetails._id": 1,
                        "doctorDetails.name": 1,
                        "doctorDetails.profilePicture": 1,
                        lastMessage: { $ifNull: ["$lastMessage", ""] }
                    },
                },
            ]);
            return result;
        });
    }
    addUserForSidebar(participants) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const newConversation = yield conversationModel_1.default.create({ participants });
            const doctorDoctorDetails = yield DoctorModel_1.DoctorModel.findOne({ _id: { $in: participants } });
            (0, appAssert_1.default)(doctorDoctorDetails, http_1.NOT_FOUND, "Doctor not found");
            return {
                _id: newConversation._id,
                doctorDetails: {
                    _id: doctorDoctorDetails === null || doctorDoctorDetails === void 0 ? void 0 : doctorDoctorDetails._id,
                    name: doctorDoctorDetails === null || doctorDoctorDetails === void 0 ? void 0 : doctorDoctorDetails.name,
                    profilePicture: doctorDoctorDetails === null || doctorDoctorDetails === void 0 ? void 0 : doctorDoctorDetails.profilePicture,
                },
                lastMessage: (_a = newConversation.lastMessage) !== null && _a !== void 0 ? _a : ""
            };
        });
    }
    ;
};
exports.ConversationRepository = ConversationRepository;
exports.ConversationRepository = ConversationRepository = __decorate([
    (0, typedi_1.Service)(IConversationRepository_1.IConversationRepositoryToken)
], ConversationRepository);
