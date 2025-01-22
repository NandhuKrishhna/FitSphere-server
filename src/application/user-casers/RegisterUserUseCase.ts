import Container, { Inject, Service } from "typedi";
import { User } from "../../domain/entities/User";
import {
  IUserRepository,
  IUserRepositoryToken,
} from "../repositories/IUserRepository";
import {
  LoginUserParams,
  RegisterUserParams,
} from "../../domain/types/userTypes";
import {
  IVerficaitonCodeRepository,
  IVerficaitonCodeRepositoryToken,
} from "../repositories/IVerificaitonCodeRepository";
import { VerificationCode } from "../../domain/entities/VerificationCode";
import VerificationCodeTypes from "../../shared/constants/verficationCodeTypes";
import mongoose, { now } from "mongoose";
import { ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from "../../shared/utils/date";
import {
  ISessionRepository,
  ISessionRepositoryToken,
} from "../repositories/ISessionRepository";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../shared/constants/env";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../shared/utils/tokenUtilty";
import appAssert from "../../shared/utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../../shared/constants/http";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  signToken,
  verfiyToken,
} from "../../shared/utils/jwt";
import { refreshTokenSignOptions } from "../../shared/utils/jwt";

export type TokenPayload = {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
};
@Service()
export class RegisterUserUseCase {
  // Injecting the concrete UserRepository
  constructor(
    @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
    @Inject(IVerficaitonCodeRepositoryToken)
    private verficationCodeRepository: IVerficaitonCodeRepository,
    @Inject(ISessionRepositoryToken)
    private sessionRepository: ISessionRepository
  ) {}

  // Register user
  async registerUser(userData: RegisterUserParams): Promise<any> {
    // verify existing user does not exist
    const existingUser = await this.userRepository.findUserByEmail(
      userData.email
    );
    appAssert(!existingUser, CONFLICT, "Email already in use");

    // Create user
    const newUser = new User(
      new mongoose.Types.ObjectId().toString(),
      userData.name,
      userData.email,
      userData.password
    );
    const user = await this.userRepository.createUser(newUser);

    //create verification code
    const verificationCode: VerificationCode = new VerificationCode(
      newUser._id,
      VerificationCodeTypes.EmailVerficaton,
      oneYearFromNow()
    );
    await this.verficationCodeRepository.createVerificationCode(
      verificationCode
    );

    // send verification email

    //create session
    const newSession = {
      userId: new mongoose.Types.ObjectId(newUser._id),
      userAgent: userData.userAgent,
      createdAt: new Date(),
      expiresAt: oneYearFromNow(),
    };
    const session = await this.sessionRepository.createSession(newSession);

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
    };
    //sign access token and refresh token
    const userId = newUser._id;
    const accessToken = signToken({
      ...sessionInfo,
      userId: userId,
    });
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

    return {
      user: user.omitPassword(),
      accessToken,
      refreshToken,
    };
  }

  // User login
  async loginUser(userData: LoginUserParams) {
    const existingUser = await this.userRepository.findUserByEmail(
      userData.email
    );
    appAssert(existingUser, UNAUTHORIZED, "Invalid email or password");

    const isValid = await existingUser.comparePassword(userData.password);
    appAssert(isValid, UNAUTHORIZED, "Invalid email or password");

    const newSession = {
      userId: new mongoose.Types.ObjectId(existingUser._id),
      userAgent: userData.userAgent,
      createdAt: new Date(),
      expiresAt: oneYearFromNow(),
      
    };
    const session = await this.sessionRepository.createSession(newSession);

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
    };
    //sign access token and refresh token
    const userId = existingUser._id;
    const accessToken = signToken({
      ...sessionInfo,
      userId: userId,
    });
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
    return {
      user: existingUser.omitPassword(),
      accessToken,
      refreshToken,
    };
  }

  async logoutUser(payload: AccessTokenPayload) {
    await this.sessionRepository.findByIdAndDelete(payload.sessionId);
  }

 // refresh token
async setRefreshToken(refreshToken: string) {
  const { payload } = verfiyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");
  const session = await this.sessionRepository.findById(payload.sessionId);
  appAssert(
    session && session.expiresAt.getTime() > Date.now(),
    UNAUTHORIZED,
    "Session expired"
  );

  // refresh the session if it expires in the next 24 hours
  const sessionNeedsRefresh = session.expiresAt.getTime() - Date.now() <= ONE_DAY_MS;
  if (sessionNeedsRefresh) {
    await this.sessionRepository.updateSession(session._id!, { expiresAt: thirtyDaysFromNow() });
  }
   
  const newRefreshToken = sessionNeedsRefresh ? signToken({
    sessionId: session._id!,
  }, refreshTokenSignOptions) : refreshToken;

  const accessToken = signToken({
    userId: session.userId.toString(),
    sessionId: session._id!
  });
  return {
    accessToken,
    newRefreshToken,
  }
}
}