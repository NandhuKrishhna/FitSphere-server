import { Inject, Service } from "typedi";
import { User } from "../../domain/entities/User";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { LoginUserParams, RegisterUserParams, ResetPasswordParams } from "../../domain/types/userTypes";
import { IVerficaitonCodeRepository, IVerficaitonCodeRepositoryToken } from "../repositories/IVerificaitonCodeRepository";
import mongoose from "mongoose";
import { fiveMinutesAgo, generateOtpExpiration, ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from "../../shared/utils/date";
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
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";
import { Doctor } from "../../domain/entities/Doctors";
import { DisplayDoctorsParams } from "../../domain/types/doctorTypes";
import cloudinary from "../../infrastructure/config/cloudinary";
export const ERRORS = {
  EMAIL_VERIFICATION_REQUIRED: "Please verify your email. A verification code has been sent to your email."
};
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
    @Inject(IDoctorRepositoryToken) private doctorRespository : IDoctorRepository
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
      VerificationCodeTypes.EmailVerification,
      generateOtpExpiration()
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
      role : "user"
    });
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
    return {
      user: user.omitPassword(),
      accessToken,
      refreshToken,
    };
  }

  async verifyOtp(code: string ,userId: string) {
    const validCode = await this.otpRepository.findOtpById(
      code,
      userId,
      OtpCodeTypes.EmailVerficaton
    );
    appAssert(validCode, NOT_FOUND, "Invalid code or expired . Please try again");

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
    const existingUser = await this.userRepository.findUserByEmail(userData.email);
    appAssert(existingUser?.status !=="blocked", UNAUTHORIZED , "Your account is suspened . Please contact with our team")
    console.log(existingUser ,' Existing User')
    appAssert(existingUser, UNAUTHORIZED, "Invalid email or password");
    
    if (!existingUser.isVerfied) {
      const otpCode: Otp = new Otp(
        new mongoose.Types.ObjectId(),
        existingUser._id,
        generateOTP(),
        VerificationCodeTypes.EmailVerification,
        generateOtpExpiration()
      );
      const newOtp = await this.otpRepository.saveOtp(otpCode);
      console.log("Newly created OTP:", newOtp);
      await sendMail({
        to: existingUser.email,
        ...getVerifyEmailTemplates(newOtp.code, existingUser.name),
      });
      appAssert(
        false,
        UNAUTHORIZED,
        ERRORS.EMAIL_VERIFICATION_REQUIRED
      );
      
    }
    const isValid = await existingUser.comparePassword(userData.password);
    appAssert(isValid, UNAUTHORIZED, "Invalid Email or Password");
  
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
      role: "user"
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
      role : "user"
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
        VerificationCodeTypes.EmailVerification
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

  // handler for user forgot password [user enter the email for getting the reset otp]
  async sendPasswordResetEmail(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    appAssert(user, NOT_FOUND, "User not found");
    console.log(user, "User after sending email for otp")
    const fiveMinAgo = fiveMinutesAgo();
    const count = await this.otpRepository.countVerificationCodes(user._id,OtpCodeTypes.PasswordReset,fiveMinAgo);
    appAssert(count <= 1,TOO_MANY_REQUESTS,"Too many requests. Please try again later.");
    const otpCode: Otp = new Otp(
      new mongoose.Types.ObjectId(),
      user._id,
      generateOTP(),
      OtpCodeTypes.PasswordReset,
      generateOtpExpiration()
    );

    const newOtp = await this.otpRepository.saveOtp(otpCode);
    console.log("new created Otp : ", newOtp);
    await sendMail({
      to: user.email,
      ...getResetPasswordEmailTemplates(newOtp.code , user.name),
    });
     const accessToken = signResetToken(({userId : user._id , email : user.email , role : "user"}));
    return {
      user: user.omitPassword(),
      accessToken
      };
  }
 // handler for verifing the otp  and redirecting to the reset password page
 async verifyResetPasswordCode(userId : string , code: string) {
  const validCode = await this.otpRepository.findOtpById(
    code,
    userId,
    OtpCodeTypes.PasswordReset
  );
  appAssert(validCode, NOT_FOUND, "Invalid code");
  await this.otpRepository.deleteOtpByEmail(userId);
 }
// handler for setting the new password
  async resetPassword({email , password} : ResetPasswordParams) {
    console.log(`Email ${email} and new Password ${password} `)
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (!existingUser) {
      appAssert(false, NOT_FOUND, "User not found");
    }
    const isOldPassword = await existingUser.comparePassword(password);
    appAssert(!isOldPassword, BAD_REQUEST, "New password cannot be the same as the old password");
    // if not set password
    const hashedPassword = await hashPassword(password);
    const updatedUser = await this.userRepository.updateUserByEmail(
      email,
      { password: hashedPassword }
    );
    appAssert(updatedUser, NOT_FOUND, "User not found");

    await this.otpRepository.deleteOtpByEmail(
      email
    );
    await this.sessionRepository.deleteSessionByEmail(email);

    return {
      user: updatedUser.omitPassword(),
    };
  }

  // handler for resend the otp code for the user 
  async resendVerificaitonCode(email: string , type : OtpCodeTypes) {
    const user = await this.userRepository.findUserByEmail(email);
    appAssert(user, NOT_FOUND, "User not found");
    const otpCode: Otp = new Otp(
      new mongoose.Types.ObjectId(),
      user._id,
      generateOTP(),
      type,
      generateOtpExpiration()
    );
    const newOtp = await this.otpRepository.saveOtp(otpCode);
    await sendMail({
      to: user.email,
      ...getVerifyEmailTemplates(newOtp.code , user.name),
    });
    return {
      otpCode: newOtp.code,
    };
  }

  async displayAllDoctors({page , limit , search , sort} : DisplayDoctorsParams) {
    let sortBy: Record<string, string> = {}; 

    if (sort[1]) {
      sortBy[sort[0]] = sort[1]; 
    } else {
      sortBy[sort[0]] = "asc"; 
    }
    
    const doctors =  await this.doctorRespository.fetchAllDoctors({page , limit , search ,sortBy});
    return doctors;
  }

  async updateProfile(userId: mongoose.Types.ObjectId, profilePic: string) {
    const uploadResponse =   await cloudinary.uploader.upload(profilePic)
    const updatedUser = await this.userRepository.updateProfile(userId , uploadResponse.secure_url);
    return updatedUser
   }

  }


