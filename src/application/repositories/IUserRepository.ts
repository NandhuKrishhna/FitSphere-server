import { Token } from "typedi";
import mongoose from "mongoose";
import { UserDocument } from "../../infrastructure/models/UserModel";

export interface IUserRepository {
  createUser(user: Partial<UserDocument>): Promise<UserDocument>;
  findUserByEmail(email: string): Promise<UserDocument | null>;
  updateUserStatus(email: string, isActive: boolean): Promise<void>;
  updateUserById(id: mongoose.Types.ObjectId, updates: Partial<UserDocument>): Promise<UserDocument | null>;
  updateUserByEmail(email: string, updates: Partial<UserDocument>): Promise<UserDocument | null>;
  findUserById(id: mongoose.Types.ObjectId): Promise<UserDocument | null>;
  updateProfile(userId: mongoose.Types.ObjectId, profilePic: string): Promise<UserDocument | null>;
  userDetails(): Promise<any>
}

export const IUserRepositoryToken = new Token<IUserRepository>();
