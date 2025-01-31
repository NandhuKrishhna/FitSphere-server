import { Inject, Service } from "typedi";
import { User } from "../../domain/entities/User";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { LoginUserParams, RegisterUserParams, ResetPasswordParams } from "../../domain/types/userTypes";
import { IVerficaitonCodeRepository, IVerficaitonCodeRepositoryToken } from "../repositories/IVerificaitonCodeRepository";
import mongoose from "mongoose";
import { fiveMinutesAgo, genrateOtpExpiration, ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from "../../shared/utils/date";
import { ISessionRepository, ISessionRepositoryToken } from "../repositories/ISessionRepository";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from "../../shared/constants/http";
import { AccessTokenPayload, RefreshTokenPayload, signResetToken, signToken, verfiyToken } from "../../shared/utils/jwt";
import { refreshTokenSignOptions } from "../../shared/utils/jwt";
import { sendMail } from "../../shared/constants/sendMail";
import { getResetPasswordEmailTemplates, getVerifyEmailTemplates } from "../../shared/utils/emialTemplates";
import { hashPassword } from "../../shared/utils/bcrypt";
import { OtpCodeTypes, VerificationCodeTypes } from "../../shared/constants/verficationCodeTypes";
import { Otp } from "../../domain/entities/Otp";
import { generateOTP } from "../../shared/utils/otpGenerator";
import { IOptverificationRepository, IOtpReposirtoryCodeToken } from "../repositories/IOtpReposirtory";
export type TokenPayload = {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
};
@Service()
export class RegisterUserUseCase {
  constructor(
    @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
    @Inject(IVerficaitonCodeRepositoryToken)
    private verificationCodeRepository: IVerficaitonCodeRepository,
    @Inject(ISessionRepositoryToken)
    private sessionRepository: ISessionRepository,
    @Inject(IOtpReposirtoryCodeToken)
    private otpRepository: IOptverificationRepository
  ) {}

  async registerUser(userData: RegisterUserParams): Promise<any> {
    const existingUser = await this.userRepository.findUserByEmail(
      userData.email
    );
    appAssert(!existingUser, CONFLICT, "Email already in use");

    const newUser = new User(
      new mongoose.Types.ObjectId(),
      userData.name,
      userData.email,
      userData.password
    );
    const user = await this.userRepository.createUser(newUser);
    const otpCode: Otp = new Otp(
      new mongoose.Types.ObjectId(),
      user._id,
      generateOTP(),
      VerificationCodeTypes.EmailVerficaton,
      genrateOtpExpiration()
    );
    const newOtp = await this.otpRepository.saveOtp(otpCode);
    console.log("new created Otp : ", newOtp);
    await sendMail({
      to: user.email,
      ...getVerifyEmailTemplates(newOtp.code, user.name),
    });
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

  async verifyOtp(code: string) {
    const validCode = await this.otpRepository.findOtpById(
      code,
      OtpCodeTypes.EmailVerficaton
    );
    appAssert(validCode, NOT_FOUND, "Invalid code");

    if (validCode.expiresAt < new Date()) {
      appAssert(false, BAD_REQUEST, "OTP has expired");
    }

    const updatedUser = await this.userRepository.updateUserById(
      validCode.userId,
      { isVerfied: true }
    );
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

    await this.otpRepository.deleteOtp(validCode._id);

    return {
      user: updatedUser.omitPassword(),
    };
  }

  async loginUser(userData: LoginUserParams) {
    const existingUser = await this.userRepository.findUserByEmail(
      userData.email
    );
    appAssert(existingUser, UNAUTHORIZED, "Invalid email or password");
    appAssert(existingUser.isVerfied, UNAUTHORIZED, "Please verify your email");

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

    const sessionNeedsRefresh =
      session.expiresAt.getTime() - Date.now() <= ONE_DAY_MS;
    if (sessionNeedsRefresh) {
      await this.sessionRepository.updateSession(session._id!, {
        expiresAt: thirtyDaysFromNow(),
      });
    }

    const newRefreshToken = sessionNeedsRefresh
      ? signToken(
          {
            sessionId: session._id!,
          },
          refreshTokenSignOptions
        )
      : refreshToken;

    const accessToken = signToken({
      userId: session.userId,
      sessionId: session._id!,
    });
    return {
      accessToken,
      newRefreshToken,
    };
  }

  async verifyEmail(code: string) {
    const valideCode =
      await this.verificationCodeRepository.findVerificationCode(
        code,
        VerificationCodeTypes.EmailVerficaton
      );
    appAssert(valideCode, NOT_FOUND, "Invalid or expired verification code");

    const updatedUser = await this.userRepository.updateUserById(
      valideCode!.userId,
      { isVerfied: true }
    );
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

    await this.verificationCodeRepository.deleteVerificationCode(
      valideCode!.userId
    );

    return {
      user: updatedUser.omitPassword(),
    };
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    appAssert(user, NOT_FOUND, "User not found");

    const fiveMinAgo = fiveMinutesAgo();
    const count = await this.otpRepository.countVerificationCodes(user._id,OtpCodeTypes.PasswordReset,fiveMinAgo);
    appAssert(count <= 1,TOO_MANY_REQUESTS,"Too many requests. Please try again later.");
    const resetToken = signResetToken({ userId: user._id });
    console.log("Temp reset token : ",resetToken)

    const otpCode: Otp = new Otp(
      new mongoose.Types.ObjectId(),
      user._id,
      generateOTP(),
      OtpCodeTypes.EmailVerficaton,
      genrateOtpExpiration()
    );

    const newOtp = await this.otpRepository.saveOtp(otpCode);
    console.log("new created Otp : ", newOtp);
    await sendMail({
      to: user.email,
      ...getResetPasswordEmailTemplates(newOtp.code , user.name),
    });
    return {
      resetToken
      };
  }

  async resetPassword({userId , password} : ResetPasswordParams) {
    const hashedPassword = await hashPassword(password);
    const updatedUser = await this.userRepository.updateUserById(
       userId,
      { password: hashedPassword }
    );
    appAssert(updatedUser, NOT_FOUND, "User not found");

    await this.otpRepository.deleteOtp(
     userId
    );
    await this.sessionRepository.deleteMany(userId);

    return {
      user: updatedUser.omitPassword(),
    };
  }
}


