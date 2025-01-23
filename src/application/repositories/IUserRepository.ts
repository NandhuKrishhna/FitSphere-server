// src/domain/entities/IUserRepository.ts
import { Token } from 'typedi';
import { User } from '../../domain/entities/User';
import mongoose from 'mongoose';


export interface IUserRepository {
    createUser(user: User): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
    updateUserStatus(email: string, isActive: boolean): Promise<void>;
    updateUserById(id: mongoose.Types.ObjectId, updates: Partial<User>): Promise<User | null>;

}

export const IUserRepositoryToken = new Token<IUserRepository>();