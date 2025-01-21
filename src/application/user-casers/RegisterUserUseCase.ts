import Container, { Inject, Service } from "typedi";
import { User } from "../../domain/entities/User";
import {
  IUserRepository,
  IUserRepositoryToken,
} from "../repositories/IUserRepository";
import { LoginUserParams, RegisterUserParams } from "../../domain/types/userTypes";
import {
  IVerficaitonCodeRepository,
  IVerficaitonCodeRepositoryToken,
} from "../repositories/IVerificaitonCodeRepository";
import { VerificationCode } from "../../domain/entities/VerificationCode";
import VerificationCodeTypes from "../../shared/constants/verficationCodeTypes";
import mongoose from "mongoose";
import { oneYearFromNow } from "../../shared/utils/date";
import { ISessionRepository, ISessionRepositoryToken } from "../repositories/ISessionRepository";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../shared/constants/env";
import { generateAccessToken, generateRefreshToken } from "../../shared/utils/tokenUtilty";
import appAssert from "../../shared/utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../../shared/constants/http";

@Service()
export class RegisterUserUseCase {
  // Injecting the concrete UserRepository
  constructor(
    @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
    @Inject(IVerficaitonCodeRepositoryToken) private verficationCodeRepository: IVerficaitonCodeRepository,
    @Inject(ISessionRepositoryToken) private sessionRepository: ISessionRepository
  ) {}

  // Register user
  async registerUser(userData: RegisterUserParams): Promise<any> {
    // verify existing user does not exist
    const existingUser = await this.userRepository.findUserByEmail(
      userData.email
    );
    appAssert(!existingUser, CONFLICT , "Email already in use");

    // Create user
    const newUser = new User(
      new mongoose.Types.ObjectId().toString(), 
      userData.name,
      userData.email,
      userData.password
    );
    const user =   await this.userRepository.createUser(newUser);
    

    //create verification code
    const verificationCode : VerificationCode = new VerificationCode(
      newUser._id,
      VerificationCodeTypes.EmailVerficaton,
      oneYearFromNow()
    )
    await this.verficationCodeRepository.createVerificationCode(verificationCode);

    // send verification email

    //create session
    const newSession = {
      userId: new mongoose.Types.ObjectId(newUser._id),
      userAgent: userData.userAgent,
      createdAt: new Date(),
      expiresAt: oneYearFromNow()
    };
    const session =  await this.sessionRepository.createSession(newSession);

    //sign access token and refresh token
    const refreshToken = generateRefreshToken({ sessionId: session._id as mongoose.Types.ObjectId });
    const accessToken = generateAccessToken({   userId: new mongoose.Types.ObjectId(newUser._id), sessionId: session._id as mongoose.Types.ObjectId  });
    return {
       user : user.omitPassword() ,
       accessToken, 
       refreshToken 
      };
}

     // User login
     async loginUser(userData : LoginUserParams){
     const existingUser = await this.userRepository.findUserByEmail(userData.email);
     appAssert(existingUser, UNAUTHORIZED,"Invalid email or password");

     const isValid = await existingUser.comparePassword(userData.password);
     appAssert(isValid, UNAUTHORIZED,"Invalid email or password");

     const newSession = {
      userId: new mongoose.Types.ObjectId(existingUser._id),
      userAgent: userData.userAgent,
      createdAt: new Date(),
      expiresAt: oneYearFromNow()
    };
    const session =  await this.sessionRepository.createSession(newSession);
    const refreshToken = generateRefreshToken({ sessionId: session._id as mongoose.Types.ObjectId });
    const accessToken = generateAccessToken({   userId: new mongoose.Types.ObjectId(existingUser._id), sessionId: session._id as mongoose.Types.ObjectId  });
    return {
      user : existingUser.omitPassword() ,
      accessToken, 
      refreshToken 
     };
    }
}