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
import { ERRORS, IcreateOtp, IcreateSession } from "../../shared/utils/builder";
import Role from "../../shared/constants/UserRole";
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";
import { oauth2Client } from "../../infrastructure/config/googleAuth";
import axios from "axios";
import { ObjectId, UserModel } from "../../infrastructure/models/UserModel";

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
    @Inject(IWalletRepositoryToken) private walletRespository: IWalletRepository,
    @Inject(IDoctorRepositoryToken) private doctorRespository: IDoctorRepository
  ) {}

  async registerUser(userData: RegisterUserParams): Promise<any> {
    const existingUser = await this.userRepository.findUserByEmail(userData.email);
    appAssert(!existingUser, CONFLICT, "Email already in use");
    const user = await this.userRepository.createUser({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      provider: "email",
      role: Role.USER,
    });
    appAssert(user, INTERNAL_SERVER_ERROR, "Error creating user . Please try again");

    const otpCode = IcreateOtp(user._id as ObjectId, OtpCodeTypes.EmailVerification);
    const newOtp = await this.otpRepository.saveOtp(otpCode);
    console.log("new created Otp : ", newOtp);
    await sendMail({
      to: user.email,
      ...getVerifyEmailTemplates(newOtp.code, user.name),
    });

    const newSession = IcreateSession(user._id as ObjectId, Role.USER, userData.userAgent, oneYearFromNow());
    const session = await this.sessionRepository.createSession(newSession);

    await this.walletRespository.createWallet({
      userId : user._id as ObjectId,
      role :"User",
    })

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
      role: Role.USER,
    };
    const userId = user._id as ObjectId;
    const accessToken = signToken({
      ...sessionInfo,
      userId: userId,
      role: Role.USER,
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
      const otpCode = IcreateOtp(existingUser._id as ObjectId, OtpCodeTypes.EmailVerification);
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

    const newSession = IcreateSession(existingUser._id as ObjectId, Role.USER, userData.userAgent, oneYearFromNow());
    const session = await this.sessionRepository.createSession(newSession);

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
      role: Role.USER,
    };
    const userId = existingUser._id as ObjectId;
    const accessToken = signToken({
      ...sessionInfo,
      userId: userId,
      role: Role.USER,
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
  async sendPasswordResetEmail(email: string, role: string) {
    let user;
    role === Role.USER
      ? (user = await this.userRepository.findUserByEmail(email))
      : (user = await this.doctorRespository.findDoctorByEmail(email));
    appAssert(user, NOT_FOUND, "User not found");
    appAssert(user.status !== "blocked", UNAUTHORIZED, "Your account is suspended. Please contact with our team");
    const fiveMinAgo = fiveMinutesAgo();
    const count = await this.otpRepository.countVerificationCodes(user._id as ObjectId, OtpCodeTypes.PasswordReset, fiveMinAgo);
    appAssert(count <= 1, TOO_MANY_REQUESTS, "Too many requests. Please try again later.");
    const otpCode = IcreateOtp(user._id as ObjectId, OtpCodeTypes.PasswordReset);
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
  async resetPassword({ userId, role, password }: ResetPasswordParams) {
    let existingUser;
    role === Role.USER
      ? (existingUser = await this.userRepository.findUserById(userId))
      : (existingUser = await this.doctorRespository.findDoctorByID(userId));

    if (!existingUser) {
      appAssert(false, NOT_FOUND, "User not found");
    }
    const isOldPassword = await existingUser.comparePassword(password);
    appAssert(!isOldPassword, BAD_REQUEST, "New password cannot be the same as the old password");
    // if not set password
    const hashedPassword = await hashPassword(password);
    let updatedUser;
    role === Role.USER
      ? (updatedUser = await this.userRepository.updateUserById(userId, { password: hashedPassword }))
      : (updatedUser = await this.doctorRespository.updateUserById(userId, { password: hashedPassword }));

    appAssert(updatedUser, NOT_FOUND, "User not found");

    await this.otpRepository.deleteOtpByUserId(userId);
    await this.sessionRepository.deleteSessionByID(userId);

    return {
      user: updatedUser.omitPassword(),
    };
  }

  // handler for resend the otp code for the user
  async resendVerificaitonCode(email: string, role: string) {
    let user;
    role === Role.USER
      ? (user = await this.userRepository.findUserByEmail(email))
      : (user = await this.doctorRespository.findDoctorByEmail(email));
    appAssert(user, NOT_FOUND, "User not found");
    await this.otpRepository.deleteOtpByUserId(user._id as ObjectId);
    const otpCode = IcreateOtp(user._id as ObjectId, OtpCodeTypes.EmailVerification);
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

  async googleAuth(code: string) {
    const googleResponse = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleResponse.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`
    );
    // console.log(userRes);
    const { email, name, picture } = userRes.data;

    let user = await this.userRepository.findUserByEmail(email);
    console.log("User from database",user)

    let isNewUser = false;

    if (!user) {
        isNewUser = true; 
        user = await this.userRepository.createUser({
          name,
          email,
          profilePicture: picture,
          role: Role.USER,
          provider: "google",
          isVerfied: true,
        });

        const newSession = IcreateSession(user._id as ObjectId, Role.USER, "", oneYearFromNow());
        await this.sessionRepository.createSession(newSession);

        await this.walletRespository.createWallet({
          userId: user._id as ObjectId,
          role: "User",
        });
    }
    const sessionInfo: RefreshTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        role: Role.USER,
    };
    const userId = user._id as ObjectId;
    const accessToken = signToken({
        ...sessionInfo,
        userId: userId,
        role: Role.USER,
    });
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            role: user.role,
            isNewUser,

        },
        accessToken,
        refreshToken,
    };
}


}
