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
exports.ChatUseCase = void 0;
const typedi_1 = require("typedi");
const IChatRepository_1 = require("../repositories/IChatRepository");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
const IConversationRepository_1 = require("../repositories/IConversationRepository");
const socket_io_1 = require("../../infrastructure/config/socket.io");
const cloudinary_1 = __importDefault(require("../../infrastructure/config/cloudinary"));
const IUserRepository_1 = require("../repositories/IUserRepository");
const IDoctorReposirtory_1 = require("../repositories/IDoctorReposirtory");
let ChatUseCase = class ChatUseCase {
    constructor(chatRepository, conversationRepository, _userRepository, _doctorRepository) {
        this.chatRepository = chatRepository;
        this.conversationRepository = conversationRepository;
        this._userRepository = _userRepository;
        this._doctorRepository = _doctorRepository;
    }
    sendMessage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ senderId, receiverId, message, image, role }) {
            (0, appAssert_1.default)((message === null || message === void 0 ? void 0 : message.trim()) || image, http_1.BAD_REQUEST, "Message or image is required");
            const participants = [senderId.toString(), receiverId.toString()].sort();
            ;
            let conversation = yield this.conversationRepository.getConversationByParticipants(participants);
            if (!conversation) {
                conversation = yield this.conversationRepository.createConversation(participants);
            }
            let imageUrl;
            if (image) {
                const uploadResponse = yield cloudinary_1.default.uploader.upload(image, { type: "authenticated" });
                imageUrl = uploadResponse.secure_url;
            }
            const newMessage = yield this.chatRepository.createMessage({
                conversationId: conversation._id,
                senderId,
                receiverId,
                message: (message === null || message === void 0 ? void 0 : message.trim()) || "",
                image: imageUrl
            });
            const user = role === "user" /* Role.USER */
                ? yield this._userRepository.findUserById(senderId)
                : yield this._doctorRepository.findDoctorByID(senderId);
            const receiverSocketid = (0, socket_io_1.getReceiverSocketId)(receiverId);
            if (receiverSocketid) {
                socket_io_1.io.to(receiverSocketid).emit("newMessage", newMessage.message);
                socket_io_1.io.to(receiverSocketid).emit("newMessageNotification", {
                    data: {
                        name: user === null || user === void 0 ? void 0 : user.name,
                        profilePicture: user === null || user === void 0 ? void 0 : user.profilePicture
                    }
                });
            }
            yield this.conversationRepository.updateLastMessage(conversation._id, message);
            return newMessage;
        });
    }
    getMessages(_a) {
        return __awaiter(this, arguments, void 0, function* ({ senderId, receiverId }) {
            const participants = [senderId.toString(), receiverId.toString()].sort();
            ;
            let conversation = yield this.conversationRepository.getConversationByParticipants(participants);
            (0, appAssert_1.default)(conversation, http_1.NOT_FOUND, "Conversation not found");
            const messages = yield this.chatRepository.getMessagesByConversationId(conversation._id);
            return {
                messages,
                conversationId: conversation._id,
            };
        });
    }
    getAllUsers(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.conversationRepository.getUsers(userId, role);
            return users;
        });
    }
    createConversation(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(senderId, http_1.NOT_FOUND, "Sender ID is required");
            (0, appAssert_1.default)(receiverId, http_1.NOT_FOUND, "Receiver ID is required");
            const participants = [senderId.toString(), receiverId.toString()].sort();
            ;
            const conversation = yield this.conversationRepository.getConversationByParticipants(participants);
            if (conversation)
                return;
            return yield this.conversationRepository.addUserForSidebar(participants);
        });
    }
    getConversation(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(senderId, http_1.NOT_FOUND, "Sender ID is required");
            (0, appAssert_1.default)(receiverId, http_1.NOT_FOUND, "Receiver ID is required");
            const participants = [senderId, receiverId].map(id => id.toString()).sort();
            const conversation = yield this.conversationRepository.getConversationByParticipants(participants);
            return conversation;
        });
    }
};
exports.ChatUseCase = ChatUseCase;
exports.ChatUseCase = ChatUseCase = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(IChatRepository_1.IChatRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(IConversationRepository_1.IConversationRepositoryToken)),
    __param(2, (0, typedi_1.Inject)(IUserRepository_1.IUserRepositoryToken)),
    __param(3, (0, typedi_1.Inject)(IDoctorReposirtory_1.IDoctorRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ChatUseCase);
