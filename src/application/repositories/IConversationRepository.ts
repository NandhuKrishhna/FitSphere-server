import { Token } from "typedi";
import { IConversation } from "../../infrastructure/models/conversationModel";
import { Types } from "mongoose";
import { QueryResult } from "../../domain/types/conversation.types";

export interface IConversationRepository {
  createConversation(participants: string[]): Promise<IConversation>;
  getConversationByParticipants(participants: string[]): Promise<IConversation | null>;
  updateLastMessage(conversationId: Types.ObjectId, message: string): Promise<IConversation | null>;
  getUsers(userId: Types.ObjectId, role: string): Promise<QueryResult>;
  addUserForSidebar(participants: string[]): Promise<IConversation>;
}

export const IConversationRepositoryToken = new Token<IConversationRepository>();
