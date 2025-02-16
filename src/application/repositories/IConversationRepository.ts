import { Token } from "typedi";
import { IConversation } from "../../infrastructure/models/conversationModel";
import { Types } from "mongoose";

export interface IConversationRepository {
    createConversation(participants: Types.ObjectId[]): Promise<IConversation>;
    getConversationByParticipants(participants: Types.ObjectId[]): Promise<IConversation | null>;
  }

export const IConversationRepositoryToken = new Token<IConversationRepository>();
