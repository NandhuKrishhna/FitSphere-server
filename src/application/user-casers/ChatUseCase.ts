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
import { profile } from "console";

@Service()
export class ChatUseCase {
  constructor(
    @Inject(IChatRepositoryToken) private chatRepository: IChatRepository,
    @Inject(IConversationRepositoryToken) private conversationRepository: IConversationRepository,
    @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
    @Inject(IDoctorRepositoryToken) private doctorRepository: IDoctorRepository,
  ) { }

  public async sendMessage({ senderId, receiverId, message, image, role }: SendMessageProps): Promise<any> {
    appAssert(message?.trim() || image, BAD_REQUEST, "Message or image is required");
    const participants = [senderId, receiverId].sort((a, b) => a.toString().localeCompare(b.toString()));
    let conversation = await this.conversationRepository.getConversationByParticipants(participants);
    if (!conversation) {
      conversation = await this.conversationRepository.createConversation(participants);
    }
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await this.chatRepository.createMessage({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message: message?.trim() || "",
      image: imageUrl
    });
    const user = role === Role.USER
      ? await this.userRepository.findUserById(senderId)
      : await this.doctorRepository.findDoctorByID(senderId);
    console.log("User detials: ", user)
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

  public async getMessages({ senderId, receiverId }: ParticipantsType): Promise<any> {
    const participants = [senderId, receiverId].sort((a, b) => a.toString().localeCompare(b.toString()));
    let conversation = await this.conversationRepository.getConversationByParticipants(participants);
    if (!conversation) {
      conversation = await this.conversationRepository.addUserForSidebar(participants);
    }
    const messages = await this.chatRepository.getMessagesByConversationId(conversation._id);
    return {
      messages,
      conversationId: conversation._id,
    };
  }

  public async getAllUsers(userId: mongoose.Types.ObjectId, role: string): Promise<any> {
    const users = await this.conversationRepository.getUsers(userId, role);
    return users;
  }
  public async createConversation(senderId: ObjectId, receiverId: ObjectId): Promise<void> {
    const participants = [senderId, receiverId].sort((a, b) => a.toString().localeCompare(b.toString()));
    const conversation = await this.conversationRepository.getConversationByParticipants(participants);
    if (conversation) return
    await this.conversationRepository.addUserForSidebar(participants);

  }
}
