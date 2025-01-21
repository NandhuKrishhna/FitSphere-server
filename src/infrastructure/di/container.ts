import "reflect-metadata";
import { Container } from "typedi";

import { IUserRepositoryToken } from "../../application/repositories/IUserRepository";
import { UserRepository } from "../repositories/UserRepository";
import { IVerficaitonCodeRepositoryToken } from "../../application/repositories/IVerificaitonCodeRepository";
import { VerificationCodeRepository } from "../repositories/VerficationCodeRepository";
import { ISessionRepositoryToken } from "../../application/repositories/ISessionRepository";
import { SessionRepository } from "../repositories/SessionRepository";

Container.set(IUserRepositoryToken, new UserRepository());
Container.set(IVerficaitonCodeRepositoryToken, new VerificationCodeRepository());
Container.set(ISessionRepositoryToken, new SessionRepository());