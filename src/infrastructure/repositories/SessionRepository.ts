import { Service } from "typedi";
import { ISessionRepository, ISessionRepositoryToken } from "../../application/repositories/ISessionRepository";
import { Session } from "../../domain/entities/Session";
import SessionMOdel from "../models/session.model";


@Service({ id: ISessionRepositoryToken })
export class SessionRepository implements ISessionRepository {
    async createSession(session: Session): Promise<Session> {
      const createdSession =   await SessionMOdel.create(session);
      return createdSession as Session
    }
}