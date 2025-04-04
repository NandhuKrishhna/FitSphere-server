import { Inject, Service } from "typedi";
import { IChatRepository, IChatRepositoryToken } from "../repositories/IChatRepository";
import { ParticipantsType, SendMessageProps } from "../../domain/types/appTypes";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../../shared/constants/http";
import { IConversationRepository, IConversationRepositoryToken } from "../repositories/IConversationRepository";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../../infrastructure/config/socket.io";
import cloudinary from "../../infrastructure/config/cloudinary";
import { ObjectId } from "../../infrastructure/models/UserModel";
import Role from "../../shared/constants/UserRole";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";
import { IConversation } from "../../infrastructure/models/conversationModel";
import { IChatUseCase, IChatUseCaseToken } from "./interface/IChatUseCase";

@Service()
export class ChatUseCase implements IChatUseCase {
  constructor(
    @Inject(IChatRepositoryToken) private chatRepository: IChatRepository,
    @Inject(IConversationRepositoryToken) private conversationRepository: IConversationRepository,
    @Inject(IUserRepositoryToken) private _userRepository: IUserRepository,
    @Inject(IDoctorRepositoryToken) private _doctorRepository: IDoctorRepository,
  ) { }

  async sendMessage({ senderId, receiverId, message, image, role }: SendMessageProps) {
    appAssert(message?.trim() || image, BAD_REQUEST, "Message or image is required");
    const participants = [senderId.toString(), receiverId.toString()].sort();;
    let conversation = await this.conversationRepository.getConversationByParticipants(participants);
    if (!conversation) {
      conversation = await this.conversationRepository.createConversation(participants);
    }
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, { type: "authenticated" });
      imageUrl = uploadResponse.public_id;
    }
    const newMessage = await this.chatRepository.createMessage({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message: message?.trim() || "",
      image: imageUrl
    });
    const user = role === Role.USER
      ? await this._userRepository.findUserById(senderId)
      : await this._doctorRepository.findDoctorByID(senderId);
    const receiverSocketid = getReceiverSocketId(receiverId);
    if (receiverSocketid) {
      io.to(receiverSocketid).emit("newMessage", newMessage.message);
      io.to(receiverSocketid).emit("newMessageNotification", {
        data: {
          name: user?.name,
          profilePicture: user?.profilePicture
        }
      });
    }
    await this.conversationRepository.updateLastMessage(conversation._id, message);
    return newMessage;
  }

  async getMessages({ senderId, receiverId }: ParticipantsType) {
    const participants = [senderId.toString(), receiverId.toString()].sort();;
    let conversation = await this.conversationRepository.getConversationByParticipants(participants);
    appAssert(conversation, NOT_FOUND, "Conversation not found");
    const messages = await this.chatRepository.getMessagesByConversationId(conversation._id);
    return {
      messages,
      conversationId: conversation._id,
    };
  }

  async getAllUsers(userId: mongoose.Types.ObjectId, role: string) {
    const users = await this.conversationRepository.getUsers(userId, role);
    return users;
  }

  async createConversation(senderId: ObjectId, receiverId: ObjectId) {
    appAssert(senderId, NOT_FOUND, "Sender ID is required");
    appAssert(receiverId, NOT_FOUND, "Receiver ID is required");
    const participants = [senderId.toString(), receiverId.toString()].sort();;
    const conversation = await this.conversationRepository.getConversationByParticipants(participants);

    if (conversation) return;

    return await this.conversationRepository.addUserForSidebar(participants);
  }


  async getConversation(senderId: ObjectId, receiverId: ObjectId): Promise<IConversation | null> {
    appAssert(senderId, NOT_FOUND, "Sender ID is required");
    appAssert(receiverId, NOT_FOUND, "Receiver ID is required");
    const participants = [senderId, receiverId].map(id => id.toString()).sort();
    const conversation = await this.conversationRepository.getConversationByParticipants(participants);
    return conversation;
  }
}
