import { Types } from "mongoose";
import {
  IConversationRepository,
  IConversationRepositoryToken,
} from "../../application/repositories/IConversationRepository";
import ConversationModel, { IConversation } from "../models/conversationModel";
import { Service } from "typedi";
import UserRoleTypes from "../../shared/constants/UserRole";

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

  async updateLastMessage(conversationId: Types.ObjectId, message: string): Promise<IConversation | null> {
    return await ConversationModel.findOneAndUpdate({ _id: conversationId }, { lastMessage: message }, { new: true });
  }
  async getUsers(userId: Types.ObjectId, role: string): Promise<any> {
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
          from: role === UserRoleTypes.USER ? "doctors" : "users",
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
          lastMessage: 1,
          _id: 1,
        },
      },
    ]);
    // console.log("Query Result:", result);
    return result;
  }

  //addign user for the sidebar;
  async addUserForSidebar(participants: Types.ObjectId[]): Promise<IConversation> {
    const existingConversation = await ConversationModel.findOne({ participants });

    if (existingConversation) {
      return existingConversation;
    }
    const newConversation = await ConversationModel.create({ participants });
    return newConversation;
  }

  async findAllMessages(senderId: Types.ObjectId): Promise<any> {
    const result = await ConversationModel.aggregate([
      {
        $match: {
          participants: { $in: [senderId] },
        },
      },
      {
        $project: {
          doctorDetails: { $ifNull: ["$doctorDetails", {}] },
          lastMessage: 1,
          _id: 1,
        },
      },
    ]);
    return result;
  }
}
