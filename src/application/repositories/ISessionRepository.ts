import { Token } from "typedi";
import { Session } from "../../domain/entities/Session";


export interface ISessionRepository {
    createSession(session: Session): Promise<Session>;
    }

export const ISessionRepositoryToken = new Token<ISessionRepository>();