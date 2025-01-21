// src/domain/entities/IUserRepository.ts
import { Token } from 'typedi';
import { User } from '../../domain/entities/User';

export interface IUserRepository {
    createUser(user: User): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
    updateUserStatus(email: string, isActive: boolean): Promise<void>;
}

export const IUserRepositoryToken = new Token<IUserRepository>();