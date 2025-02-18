import { Inject, Service } from "typedi";
import { IChatRepository, IChatRepositoryToken } from "../repositories/IChatRepository";
import { ParticipantsType, SendMessageProps } from "../../domain/types/appTypes";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../../shared/constants/http";
import { IConversationRepository, IConversationRepositoryToken } from "../repositories/IConversationRepository";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../../infrastructure/config/socket.io";

@Service()
export class ChatUseCase {
  constructor(
    @Inject(IChatRepositoryToken) private chatRepository: IChatRepository,
    @Inject(IConversationRepositoryToken) private conversationRepository: IConversationRepository
  ) {}

  public async sendMessage({ senderId, receiverId, message }: SendMessageProps): Promise<any> {
    appAssert(message || message.trim() !== "", BAD_REQUEST, "Message is required");
    const participants = [senderId, receiverId].sort((a, b) => a.toString().localeCompare(b.toString()));
    let conversation = await this.conversationRepository.getConversationByParticipants(participants);
    if (!conversation) {
      conversation = await this.conversationRepository.createConversation(participants);
    }
    const newMessage = await this.chatRepository.createMessage({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message,
    });
    const receiverSocketid = getReceiverSocketId(receiverId);
    if (receiverSocketid) {
      io.to(receiverSocketid).emit("newMessage", newMessage);
    }
    await this.conversationRepository.updateLastMessage(conversation._id, message);

    return newMessage;
  }

  public async getMessages({ senderId, receiverId }: ParticipantsType): Promise<any> {
    const participants = [senderId, receiverId].sort((a, b) => a.toString().localeCompare(b.toString()));
    const conversation = await this.conversationRepository.getConversationByParticipants(participants);
    appAssert(conversation, NOT_FOUND, "No Convesation Found. Send Message");
    const messages = await this.chatRepository.getMessagesByConversationId(conversation._id);
    return messages;
  }

  public async getAllUsers(userId: mongoose.Types.ObjectId, role: string): Promise<any> {
    const users = await this.conversationRepository.getUsers(userId, role);
    return users;
  }
}
