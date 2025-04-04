import { Token } from "typedi";
import { ParticipantsType, SendMessageProps } from "../../../domain/types/appTypes";
import { IChat } from "../../../infrastructure/models/chatModel";
import { IGetMessageResposne } from "../interface-types/UseCase-types";
import { ConversationResponse, QueryResult } from "../../../domain/types/conversation.types";
import mongoose from "mongoose";
import { ObjectId } from "../../../infrastructure/models/UserModel";
import { IConversation } from "../../../infrastructure/models/conversationModel";

export interface IChatUseCase {
    sendMessage({ senderId, receiverId, message, image, role }: SendMessageProps): Promise<IChat>;
    getMessages({ senderId, receiverId }: ParticipantsType): Promise<IGetMessageResposne>;
    getAllUsers(userId: mongoose.Types.ObjectId, role: string): Promise<QueryResult>;
    createConversation(senderId: ObjectId, receiverId: ObjectId): Promise<ConversationResponse | undefined>;
    getConversation(senderId: ObjectId, receiverId: ObjectId): Promise<IConversation | null>
};
export const IChatUseCaseToken = new Token<IChatUseCase>();