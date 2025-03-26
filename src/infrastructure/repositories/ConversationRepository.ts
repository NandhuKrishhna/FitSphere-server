import { Types } from "mongoose";
import {
  IConversationRepository,
  IConversationRepositoryToken,
} from "../../application/repositories/IConversationRepository";
import ConversationModel, { IConversation } from "../models/conversationModel";
import { Service } from "typedi";
import Role from "../../shared/constants/UserRole";
import { QueryResult } from "../../domain/types/conversation.types";

export type GetUserType = {
  _id: string;
  name: string;
  profilePicture: string;
  lastMessage: string;
  updatedAt: string;
}

@Service(IConversationRepositoryToken)
export class ConversationRepository implements IConversationRepository {
  async createConversation(participants: string[]): Promise<IConversation> {
    const conversation = new ConversationModel({ participants });
    return await conversation.save();
  }

  async getConversationByParticipants(participants: string[]): Promise<IConversation | null> {
    return await ConversationModel.findOne({
      participants: { $all: participants, $size: participants.length },
    }).lean();
  }


  async updateLastMessage(conversationId: Types.ObjectId, message: string): Promise<IConversation | null> {
    return await ConversationModel.findOneAndUpdate({ _id: conversationId }, { lastMessage: message }, { new: true });
  }
  async getUsers(userId: Types.ObjectId, role: string): Promise<QueryResult> {
    const result = await ConversationModel.aggregate([
      {
        $match: {
          participants: { $in: [userId] },
        },
      },
      {
        $addFields: {
          participants: {
            $map: {
              input: "$participants",
              as: "participant",
              in: { $toObjectId: "$$participant" },
            },
          },
        },
      },
      {
        $lookup: {
          from: role === Role.USER ? "doctors" : "users",
          localField: "participants",
          foreignField: "_id",
          as: "doctorDetails",
        },
      },
      {
        $unwind: {
          path: "$doctorDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          "doctorDetails._id": 1,
          "doctorDetails.name": 1,
          "doctorDetails.profilePicture": 1,
          lastMessage: { $ifNull: ["$lastMessage", ""] }
        },
      },
    ]);
    return result;
  }

  async addUserForSidebar(participants: string[]): Promise<IConversation> {
    const existingConversation = await ConversationModel.findOne({ participants });

    if (existingConversation) {
      return existingConversation;
    }
    const newConversation = await ConversationModel.create({ participants });
    return newConversation;
  };
}
