import { Types } from "mongoose";
import { IConversationRepository, IConversationRepositoryToken } from "../../application/repositories/IConversationRepository";
import ConversationModel, { IConversation } from "../models/conversationModel";
import { Service } from "typedi";



@Service(IConversationRepositoryToken)
export class ConversationRepository implements IConversationRepository {
    async createConversation(participants: Types.ObjectId[]): Promise<IConversation> {
      const conversation = new ConversationModel({ participants });
      return await conversation.save();
    }
  
    async getConversationByParticipants(participants: Types.ObjectId[]): Promise<IConversation | null> {
      return await ConversationModel.findOne({
        participants: { $all: participants },
      });
    }
}   