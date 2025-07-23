import { Service } from "typedi";
import { IUserRepository, IUserRepositoryToken } from "../../application/repositories/IUserRepository";
import { UserDocument, UserModel } from "../models/UserModel";
import { User, UserType } from "../../domain/entities/User";
import mongoose from "mongoose";
import { UserStats } from "../../application/user-cases/interface-types/UseCase-types";

@Service(IUserRepositoryToken)
export class UserRepository implements IUserRepository {
  async createUser(user: UserDocument): Promise<UserDocument> {
    const result = await UserModel.create(user)
    return result;
  }
  async findUserByEmail(email: string): Promise<UserDocument | null> {
    const result = await UserModel.findOne({ email })
    return result;
  }
  async updateUserStatus(email: string, isActive: boolean): Promise<void> {
    await UserModel.updateOne({ email }, { isActive });
  }

  async updateUserById(id: mongoose.Types.ObjectId, updates: Partial<UserDocument>): Promise<UserDocument | null> {
    const result = await UserModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return result;
  }

  async updateUserByEmail(email: string, updates: Partial<UserDocument>): Promise<UserDocument | null> {
    const result = await UserModel.findOneAndUpdate({ email }, { $set: updates }, { new: true });
    return result;
  }
  async findUserById(id: mongoose.Types.ObjectId): Promise<UserDocument | null> {
    const user = await UserModel.findById(id)
      .select("-password -__v -createdAt -updatedAt");
    return user;
  }

  async updateProfile(userId: mongoose.Types.ObjectId, profilePic: string): Promise<UserDocument | null> {
    console.log(`Updating profile picture for user ID: ${userId} with URL: ${profilePic}`);
    const result = await UserModel.findOneAndUpdate(
      { _id: userId },
      { profilePicture: profilePic },
      { new: true, fields: "_id name email profilePicture role" }
    );
    return result;
  }

  async userDetails(): Promise<UserStats> {
    const stats = await UserModel.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          blockedUsers: { $sum: { $cond: [{ $eq: ["$status", "blocked"] }, 1, 0] } },
          activeUsers: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          verifiedUsers: { $sum: { $cond: [{ $eq: ["$isVerfied", true] }, 1, 0] } },
          premiumUsers: { $sum: { $cond: [{ $eq: ["$isPremium", true] }, 1, 0] } },
          normalUsers: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } }
        }
      }
    ]);



    return stats.length > 0 ? stats[0] : {
      totalUsers: 0,
      blockedUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      premiumUsers: 0,
      normalUsers: 0
    };
  }

}
