import { Types } from "mongoose";
import { IChatRepository } from "../../application/repositories/IChatRepository";
import ChatModel, { IChat } from "../models/chatModel";

export class ChatRepository implements IChatRepository {
  async createMessage(messageData: Partial<IChat>): Promise<IChat> {
    const message = new ChatModel(messageData);
    return await message.save();
  }

  async getMessagesByConversationId(conversationId: Types.ObjectId): Promise<IChat[]> {
    return await ChatModel.find({ conversationId })
      .sort({ createdAt: 1 })
      .select("senderId receiverId message isRead createdAt");
  }

  async markMessageAsRead(messageId: Types.ObjectId): Promise<void> {
    await ChatModel.findByIdAndUpdate(messageId, { isRead: true });
  }
}
