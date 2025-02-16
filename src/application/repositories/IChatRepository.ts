import { Token } from "typedi";
import { IChat } from "../../infrastructure/models/chatModel";
import { Types } from "mongoose";

export interface IChatRepository {
  createMessage(messageData: Partial<IChat>): Promise<IChat>;
  getMessagesByConversationId(conversationId: Types.ObjectId): Promise<IChat[]>;
  markMessageAsRead(messageId: Types.ObjectId): Promise<void>;
}
  
export const IChatRepositoryToken = new Token<IChatRepository>();