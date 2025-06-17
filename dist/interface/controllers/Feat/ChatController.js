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
exports.ChatController = void 0;
const typedi_1 = require("typedi");
const ChatUseCase_1 = require("../../../application/user-casers/ChatUseCase");
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const bcrypt_1 = require("../../../shared/utils/bcrypt");
const http_1 = require("../../../shared/constants/http");
let ChatController = class ChatController {
    constructor(_chatUseCase) {
        this._chatUseCase = _chatUseCase;
        //send message
        this.sendMessageHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId: senderId, role } = req;
            const receiverId = (0, bcrypt_1.stringToObjectId)(req.body.receiverId);
            const message = req.body.message;
            const image = req.body.image;
            const newMessage = yield this._chatUseCase.sendMessage({
                senderId,
                receiverId,
                message,
                image,
                role
            });
            res.status(http_1.CREATED).json({
                success: true,
                message: "Message sent successfully",
                newMessage,
            });
        }));
        //get messages
        this.getMessagesHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const receiverId = (0, bcrypt_1.stringToObjectId)(req.query.receiverId);
            const { userId: senderId } = req;
            const { messages, conversationId } = yield this._chatUseCase.getMessages({
                senderId,
                receiverId,
            });
            res.status(http_1.OK).json({
                success: true,
                message: "Message Fetch Successfully",
                messages: messages ? messages : "No messages found",
                conversationId,
            });
        }));
        this.getAllUsersHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const { role } = req;
            const users = yield this._chatUseCase.getAllUsers(userId, role);
            res.status(http_1.OK).json({
                success: true,
                message: "Users fetched successfully",
                users,
            });
        }));
        this.createConversationHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId: senderId } = req;
            const receiverId = (0, bcrypt_1.stringToObjectId)(req.body.receiverId);
            const response = yield this._chatUseCase.createConversation(senderId, receiverId);
            res.status(http_1.CREATED).json({
                success: true,
                message: "Conversation created successfully",
                response
            });
        }));
        this.getConversationHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId: senderId } = req;
            const receiverId = (0, bcrypt_1.stringToObjectId)(req.query.receiverId);
            const conversation = yield this._chatUseCase.getConversation(senderId, receiverId);
            if (conversation) {
                return res.status(http_1.OK).json({
                    success: true,
                    message: "Conversation found successfully",
                    conversation,
                });
            }
            return res.status(http_1.NOT_FOUND).json({
                success: false,
                message: "No conversation was found",
            });
        }));
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)()),
    __metadata("design:paramtypes", [ChatUseCase_1.ChatUseCase])
], ChatController);
