// src/domain/entities/IUserRepository.ts
import { Token } from "typedi";
import { User, UserType } from "../../domain/entities/User";
import mongoose from "mongoose";

export interface IUserRepository {
  createUser(user: UserType): Promise<UserType>;
  findUserByEmail(email: string): Promise<UserType | null>;
  updateUserStatus(email: string, isActive: boolean): Promise<void>;
  updateUserById(id: mongoose.Types.ObjectId, updates: Partial<UserType>): Promise<UserType | null>;
  updateUserByEmail(email: string, updates: Partial<UserType>): Promise<UserType | null>;
  findUserById(id: mongoose.Types.ObjectId): Promise<UserType | null>;
  updateProfile(userId: mongoose.Types.ObjectId, profilePic: string): Promise<UserType | null>;
}

export const IUserRepositoryToken = new Token<IUserRepository>();
