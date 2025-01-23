import { Token } from "typedi";
import { Session } from "../../domain/entities/Session";
import mongoose, { ObjectId } from "mongoose";


export interface ISessionRepository {
    createSession(session: Session): Promise<Session>;
    findByIdAndDelete(id:mongoose.Types.ObjectId): Promise<Session | null>;
    findById(id:mongoose.Types.ObjectId): Promise<Session | null>;
    updateSession(id: mongoose.Types.ObjectId, updates: Partial<Session>): Promise<Session | null>;
    deleteMany(id: mongoose.Types.ObjectId): Promise<void>;
    }

   

export const ISessionRepositoryToken = new Token<ISessionRepository>();