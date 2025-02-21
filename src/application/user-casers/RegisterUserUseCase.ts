import { Inject, Service } from "typedi";
import { User } from "../../domain/entities/User";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { LoginUserParams, RegisterUserParams, ResetPasswordParams } from "../../domain/types/userTypes";
import {
  IVerficaitonCodeRepository,
  IVerficaitonCodeRepositoryToken,
} from "../repositories/IVerificaitonCodeRepository";
import mongoose from "mongoose";
import { fiveMinutesAgo, ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from "../../shared/utils/date";
import { ISessionRepository, ISessionRepositoryToken } from "../repositories/ISessionRepository";
import appAssert from "../../shared/utils/appAssert";
import {
  BAD_REQUEST,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../../shared/constants/http";
import { AccessTokenPayload, RefreshTokenPayload, signToken, verfiyToken } from "../../shared/utils/jwt";
import { refreshTokenSignOptions } from "../../shared/utils/jwt";
import { sendMail } from "../../shared/constants/sendMail";
import { getResetPasswordEmailTemplates, getVerifyEmailTemplates } from "../../shared/utils/emialTemplates";
import { hashPassword } from "../../shared/utils/bcrypt";
import { OtpCodeTypes, VerificationCodeTypes } from "../../shared/constants/verficationCodeTypes";
import { IOptverificationRepository, IOtpReposirtoryCodeToken } from "../repositories/IOtpReposirtory";

import { IWalletRepository, IWalletRepositoryToken } from "../repositories/IWalletRepository";
import { ERRORS, IcreateOtp, IcreateSession, IcreateWallet } from "../../shared/utils/builder";
import UserRoleTypes from "../../shared/constants/UserRole";

export type TokenPayload = {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
};
@Service()
export class RegisterUserUseCase {
  constructor(
    @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
    @Inject(IVerficaitonCodeRepositoryToken) private verificationCodeRepository: IVerficaitonCodeRepository,
    @Inject(ISessionRepositoryToken) private sessionRepository: ISessionRepository,
    @Inject(IOtpReposirtoryCodeToken) private otpRepository: IOptverificationRepository,
    @Inject(IWalletRepositoryToken) private walletRespository: IWalletRepository
  ) {}

  async registerUser(userData: RegisterUserParams): Promise<any> {
    const existingUser = await this.userRepository.findUserByEmail(userData.email);
    appAssert(!existingUser, CONFLICT, "Email already in use");

    const newUser = new User(new mongoose.Types.ObjectId(), userData.name, userData.email, userData.password);
    const user = await this.userRepository.createUser(newUser);
    appAssert(user, INTERNAL_SERVER_ERROR, "Error creating user . Please try again");

    const otpCode = IcreateOtp(user._id, OtpCodeTypes.EmailVerification);
    const newOtp = await this.otpRepository.saveOtp(otpCode);
    console.log("new created Otp : ", newOtp);
    await sendMail({
      to: user.email,
      ...getVerifyEmailTemplates(newOtp.code, user.name),
    });

    const newSession = IcreateSession(newUser._id, UserRoleTypes.USER, userData.userAgent, oneYearFromNow());
    const session = await this.sessionRepository.createSession(newSession);

    // creating a wallet for the user
    const newWallet = IcreateWallet(user._id);
    await this.walletRespository.createWallet(newWallet);

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
      role: UserRoleTypes.USER,
    };
    const userId = newUser._id;
    const accessToken = signToken({
      ...sessionInfo,
      userId: userId,
      role: UserRoleTypes.USER,
    });
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async verifyOtp(code: string, userId: mongoose.Types.ObjectId) {
    const validCode = await this.otpRepository.findOtpById(code, userId, OtpCodeTypes.EmailVerification);

    appAssert(validCode, NOT_FOUND, "Invalid code or expired . Please try again");
    appAssert(validCode.expiresAt > new Date(), BAD_REQUEST, "OTP has expired");

    const updatedUser = await this.userRepository.updateUserById(validCode.userId, { isVerfied: true });
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

    await this.otpRepository.deleteOtp(validCode._id);

    return {
      user: updatedUser.omitPassword(),
    };
  }

  async loginUser(userData: LoginUserParams) {
    const existingUser = await this.userRepository.findUserByEmail(userData.email);
    appAssert(
      existingUser?.status !== "blocked",
      UNAUTHORIZED,
      "Your account is suspened . Please contact with our team"
    );
    appAssert(existingUser, UNAUTHORIZED, "Invalid email or password");

    if (!existingUser.isVerfied) {
      const otpCode = IcreateOtp(existingUser._id, OtpCodeTypes.EmailVerification);
      const newOtp = await this.otpRepository.saveOtp(otpCode);
      console.log("Newly created OTP:", newOtp);
      await sendMail({
        to: existingUser.email,
        ...getVerifyEmailTemplates(newOtp.code, existingUser.name),
      });
      appAssert(false, UNAUTHORIZED, ERRORS.EMAIL_VERIFICATION_REQUIRED);
    }

    const isValid = await existingUser.comparePassword(userData.password);
    appAssert(isValid, UNAUTHORIZED, "Invalid Email or Password");

    const newSession = IcreateSession(existingUser._id, UserRoleTypes.USER, userData.userAgent, oneYearFromNow());
    const session = await this.sessionRepository.createSession(newSession);

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
      role: UserRoleTypes.USER,
    };
    const userId = existingUser._id;
    const accessToken = signToken({
      ...sessionInfo,
      userId: userId,
      role: UserRoleTypes.USER,
    });
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

    return {
      user: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        profilePicture: existingUser.profilePicture,
        role: existingUser.role,
      },
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
    appAssert(session?.role === payload.role, UNAUTHORIZED, "UnAuthorized! Please Login Again");
    appAssert(session && session.expiresAt.getTime() > Date.now(), UNAUTHORIZED, "Session expired");
    const sessionNeedsRefresh = session.expiresAt.getTime() - Date.now() <= ONE_DAY_MS;
    if (sessionNeedsRefresh) {
      await this.sessionRepository.updateSession(session._id!, {
        expiresAt: thirtyDaysFromNow(),
      });
    }

    const newRefreshToken = sessionNeedsRefresh
      ? signToken(
          {
            sessionId: session._id!,
            role: payload.role,
          },
          refreshTokenSignOptions
        )
      : refreshToken;
    const accessToken = signToken({
      userId: session.userId,
      sessionId: session._id!,
      role: session.role,
    });
    return {
      accessToken,
      newRefreshToken,
    };
  }

  async verifyEmail(code: string) {
    const valideCode = await this.verificationCodeRepository.findVerificationCode(
      code,
      VerificationCodeTypes.EmailVerification
    );
    appAssert(valideCode, NOT_FOUND, "Invalid or expired verification code");

    const updatedUser = await this.userRepository.updateUserById(valideCode!.userId, { isVerfied: true });
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

    await this.verificationCodeRepository.deleteVerificationCode(valideCode!.userId);

    return {
      user: updatedUser.omitPassword(),
    };
  }

  // handler for user forgot password [user enter the email for getting the reset otp]
  async sendPasswordResetEmail(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(user.status !== "blocked", UNAUTHORIZED, "Your account is suspended. Please contact with our team");
    const fiveMinAgo = fiveMinutesAgo();
    const count = await this.otpRepository.countVerificationCodes(user._id, OtpCodeTypes.PasswordReset, fiveMinAgo);
    appAssert(count <= 1, TOO_MANY_REQUESTS, "Too many requests. Please try again later.");
    const otpCode = IcreateOtp(user._id, OtpCodeTypes.PasswordReset);
    const newOtp = await this.otpRepository.saveOtp(otpCode);
    console.log("new created Otp : ", newOtp);
    await sendMail({
      to: user.email,
      ...getResetPasswordEmailTemplates(newOtp.code, user.name),
    });
    return {
      user: user.omitPassword(),
    };
  }
  // handler for verifing the otp  and redirecting to the reset password page
  async verifyResetPassword(userId: mongoose.Types.ObjectId, code: string) {
    const validCode = await this.otpRepository.findOtpById(code, userId, OtpCodeTypes.PasswordReset);
    appAssert(validCode, NOT_FOUND, "Invalid code");
    appAssert(validCode.expiresAt > new Date(), BAD_REQUEST, "OTP has expired");

    return {
      user: validCode.userId,
    };
  }
  // handler for setting the new password
  async resetPassword({ userId, password }: ResetPasswordParams) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) {
      appAssert(false, NOT_FOUND, "User not found");
    }
    const isOldPassword = await existingUser.comparePassword(password);
    appAssert(!isOldPassword, BAD_REQUEST, "New password cannot be the same as the old password");
    // if not set password
    const hashedPassword = await hashPassword(password);
    const updatedUser = await this.userRepository.updateUserById(userId, { password: hashedPassword });
    appAssert(updatedUser, NOT_FOUND, "User not found");

    await this.otpRepository.deleteOtpByUserId(userId);
    await this.sessionRepository.deleteSessionByID(userId);

    return {
      user: updatedUser.omitPassword(),
    };
  }

  // handler for resend the otp code for the user
  async resendVerificaitonCode(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    appAssert(user, NOT_FOUND, "User not found");
    await this.otpRepository.deleteOtpByUserId(user._id);
    const otpCode = IcreateOtp(user._id, OtpCodeTypes.EmailVerification);
    const newOtp = await this.otpRepository.saveOtp(otpCode);
    console.log(newOtp);
    await sendMail({
      to: user.email,
      ...getVerifyEmailTemplates(newOtp.code, user.name),
    });
    return {
      otpCode: newOtp.code,
      user: user.omitPassword(),
    };
  }
}
