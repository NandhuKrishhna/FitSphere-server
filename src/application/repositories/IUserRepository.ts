// src/domain/entities/IUserRepository.ts
import { Token } from 'typedi';
import { User } from '../../domain/entities/User';
import mongoose from 'mongoose';


export interface IUserRepository {
    createUser(user: User): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
    updateUserStatus(email: string, isActive: boolean): Promise<void>;
    updateUserById(id: mongoose.Types.ObjectId, updates: Partial<User>): Promise<User | null>;
    updateUserByEmail(email: string, updates: Partial<User>): Promise<User | null>;
    findUserById(id: mongoose.Types.ObjectId): Promise<User | null>;
    updateProfile(userId: mongoose.Types.ObjectId, profilePic: string): Promise<User | null>;
}

export const IUserRepositoryToken = new Token<IUserRepository>();