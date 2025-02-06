import { Service } from "typedi";
import { ISessionRepository, ISessionRepositoryToken } from "../../application/repositories/ISessionRepository";
import { Session } from "../../domain/entities/Session";

import mongoose from "mongoose";
import SessionModel from "../models/session.model";


@Service({ id: ISessionRepositoryToken })
export class SessionRepository implements ISessionRepository {
  // create session
    async createSession(session: Session): Promise<Session> {
      const createdSession =   await SessionModel.create(session);
      return createdSession as Session
    }
    // delete session
    async findByIdAndDelete(id: mongoose.Types.ObjectId): Promise<Session | null> {
        return await SessionModel.findByIdAndDelete(id).exec();
    }
    // find session by id
    async findById(id: mongoose.Types.ObjectId): Promise<Session | null> {
        return await SessionModel.findById(id)
     }
    // update session
    async updateSession(id: mongoose.Types.ObjectId, updates: Partial<Session>): Promise<Session | null> {
      return await SessionModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).exec();
    }

    // session delete many
    async deleteMany(id: mongoose.Types.ObjectId): Promise<void> {
      await SessionModel.deleteMany({ userId: id }).exec();
    }

    async deleteSessionByEmail(email: string): Promise<void> {
      await SessionModel.deleteMany({ email }).exec();
    }
    
  }
