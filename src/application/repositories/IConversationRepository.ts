import { Token } from "typedi";
import { IConversation } from "../../infrastructure/models/conversationModel";
import { Types } from "mongoose";

export interface IConversationRepository {
  createConversation(participants: Types.ObjectId[]): Promise<IConversation>;
  getConversationByParticipants(participants: Types.ObjectId[]): Promise<IConversation | null>;
  updateLastMessage(conversationId: Types.ObjectId, message: string): Promise<IConversation | null>;
  getUsers(userId: Types.ObjectId, role: string): Promise<any>;
  addUserForSidebar(participants: Types.ObjectId[]): Promise<IConversation>;
  //doctor find messages
  findAllMessages(senderId: Types.ObjectId): Promise<any>;
}

export const IConversationRepositoryToken = new Token<IConversationRepository>();
