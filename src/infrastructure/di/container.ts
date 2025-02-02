import "reflect-metadata";
import { Container } from "typedi";

import { IUserRepositoryToken } from "../../application/repositories/IUserRepository";
import { UserRepository } from "../repositories/UserRepository";
import { IVerficaitonCodeRepositoryToken } from "../../application/repositories/IVerificaitonCodeRepository";
import { VerificationCodeRepository } from "../repositories/VerficationCodeRepository";
import { ISessionRepositoryToken } from "../../application/repositories/ISessionRepository";
import { SessionRepository } from "../repositories/SessionRepository";
<<<<<<< HEAD
import { IDoctorRepositoryToken } from "../../application/repositories/IDoctorRepository";
=======
import { IOtpReposirtoryCodeToken } from "../../application/repositories/IOtpReposirtory";
import { OtpRepository } from "../repositories/OtpRepository";
import { IDoctorRepositoryToken } from "../../application/repositories/IDoctorReposirtory";
>>>>>>> authentication-feat
import { DoctorRepository } from "../repositories/DoctorRepository";

Container.set(IUserRepositoryToken, new UserRepository());
Container.set(IVerficaitonCodeRepositoryToken, new VerificationCodeRepository());
Container.set(ISessionRepositoryToken, new SessionRepository());
<<<<<<< HEAD
Container.set(IDoctorRepositoryToken, new DoctorRepository());
=======
Container.set(IOtpReposirtoryCodeToken, new OtpRepository());
Container.set(IDoctorRepositoryToken , new DoctorRepository());
>>>>>>> authentication-feat
