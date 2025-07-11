import { Inject, Service } from "typedi";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } from "../../shared/constants/http";
import mongoose from "mongoose";
import { oneYearFromNow } from "../../shared/utils/date";
import {
  IVerficaitonCodeRepository,
  IVerficaitonCodeRepositoryToken,
} from "../repositories/IVerificaitonCodeRepository";
import { sendMail } from "../../shared/constants/sendMail";
import { ISessionRepository, ISessionRepositoryToken } from "../repositories/ISessionRepository";
import { AccessTokenPayload, RefreshTokenPayload, refreshTokenSignOptions, signToken } from "../../shared/utils/jwt";
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";
import { DoctorDetailsParams, DoctorInfoParams, RegisterDoctorParams } from "../../domain/types/doctorTypes";
import { NotificationType, OtpCodeTypes, VerificationCodeTypes } from "../../shared/constants/verificationCodeTypes";
import { getVerifyEmailTemplates } from "../../shared/utils/emialTemplates";
import { IOptverificationRepository, IOtpReposirtoryCodeToken } from "../repositories/IOtpReposirtory";
import { getPendingApprovalEmailTemplate } from "../../shared/utils/doctorEmailTemplates";
import { INotificationRepository, INotificationRepositoryToken } from "../repositories/INotificationRepository";
import cloudinary from "../../infrastructure/config/cloudinary";
import { LoginUserParams } from "../../domain/types/userTypes";
import Role from "../../shared/constants/UserRole";
import { IcreateOtp, IcreateSession } from "../../shared/utils/builder";
import { IcreateDoctorDetails } from "../../shared/utils/doctorHelper";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { updatePasswordParams } from "../../domain/types/doctorUseCase.types";
import { IDoctorUseCase, IDoctorUseCaseToken } from "./interface/IDoctorUseCase";
import { DoctorDocument } from "../../infrastructure/models/DoctorModel";
import { DoctorDetailsDocument } from "../../infrastructure/models/doctor.details.model";



@Service()
export class DoctorUseCase implements IDoctorUseCase {
  constructor(
    @Inject(IDoctorRepositoryToken) private _doctorRepository: IDoctorRepository,
    @Inject(IVerficaitonCodeRepositoryToken) private verificationCodeRepository: IVerficaitonCodeRepository,
    @Inject(ISessionRepositoryToken) private _sessionRepository: ISessionRepository,
    @Inject(IOtpReposirtoryCodeToken) private otpRepository: IOptverificationRepository,
    @Inject(INotificationRepositoryToken) private __notificationRepository: INotificationRepository,
    @Inject(IUserRepositoryToken) private _userRepository: IUserRepository,

  ) { }

  async registerDoctor(details: RegisterDoctorParams) {
    const existingDoctor = await this._doctorRepository.findDoctorByEmail(details.email);
    appAssert(!existingDoctor, CONFLICT, "Email already exists");
    // create doctor
    const newDoctor = await this._doctorRepository.createDoctor({
      email: details.email,
      password: details.password,
      name: details.name,
      role: Role.DOCTOR,
      provider: "email",
    })
    const doctor = await this._doctorRepository.createDoctor(newDoctor);
    // send verfication email
    const otpCode = IcreateOtp(doctor._id as ObjectId, OtpCodeTypes.EmailVerification);
    const newOtp = await this.otpRepository.saveOtp(otpCode);
    await sendMail({
      to: doctor.email,
      ...getVerifyEmailTemplates(newOtp.code, newDoctor.name),
    });
    return {
      user: doctor
    };
  }
  // register as doctor;
  async registerAsDoctor({ userId, details, doctorInfo }: {
    userId: mongoose.Types.ObjectId;
    details: DoctorDetailsParams;
    doctorInfo: DoctorInfoParams;
  }) {

    const existingDoctor = await this._doctorRepository.findDoctorDetails(userId);
    appAssert(!existingDoctor, CONFLICT, "Email already exists");
    const doctor = await this._doctorRepository.findDoctorByID(userId);
    let doctorName;
    if (doctor) {
      doctorName = doctor.name;
    }
    // upload image to cloudinary>>>>>
    const uploadResponse = details.certificate
      ? await cloudinary.uploader.upload(details.certificate, {
        resource_type: "auto",
      })
      : null;
    const doctorDetails = IcreateDoctorDetails(
      userId,
      details.experience!,
      details.consultationFees!,
      details.contactPhoneNumber!,
      details.professionalEmail!,
      details.officeAddress!,
      details.clinicLocations!,
      details.consultationLanguages!,
      details.primarySpecialty!,
      details.medicalLicenseNumber!,
      details.gender!,
      details.professionalTitle!,
      details.bio!,
      uploadResponse?.secure_url!
    );
    //add to the database;
    const newDoctorDetails = await this._doctorRepository.createDoctorDetails(doctorDetails);
    const newDoctorEmail = newDoctorDetails.professionalEmail;
    await sendMail({ to: newDoctorEmail, ...getPendingApprovalEmailTemplate() });
    let message = `${doctorName} has registered as a doctor and is waiting for approval.`;

    const notification = await this.__notificationRepository.createNotification({
      userId,
      role: Role.ADMIN,
      type: NotificationType.DoctorRegistration,
      message,
      status: "pending",
      metadata: { ...doctorInfo, ...newDoctorDetails },
      read: false,
    });

    const new_notification = await this.__notificationRepository.createNotification(notification);

    return {
      doctorDetails: newDoctorDetails as DoctorDetailsDocument,
      notification: new_notification,
    };
  }

  //verify email
  async verifyEmail(code: string) {
    const valideCode = await this.verificationCodeRepository.findVerificationCode(
      code,
      VerificationCodeTypes.EmailVerification
    );
    appAssert(valideCode, NOT_FOUND, "Invalid or expired verification code");
    const updatedUser = await this._doctorRepository.updateUserById(valideCode!.userId, { isVerified: true });
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");
    await this.verificationCodeRepository.deleteVerificationCode(valideCode!.userId);
    return updatedUser;
  }

  async verifyOtp(code: string, userId: mongoose.Types.ObjectId) {
    const validCode = await this.otpRepository.findOtpById(code, userId, OtpCodeTypes.EmailVerification);
    appAssert(validCode, NOT_FOUND, "Invalid code");
    if (validCode.expiresAt < new Date()) {
      appAssert(false, BAD_REQUEST, "OTP has expired");
    }
    const updatedUser = await this._doctorRepository.updateUserById(validCode.userId, { isVerified: true });
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");
    await this.otpRepository.deleteOtp(validCode._id);
    return { user: updatedUser };
  }

  async loginDoctor(doctorData: LoginUserParams) {
    const existingDoctor = await this._doctorRepository.findDoctorByEmail(doctorData.email);
    appAssert(existingDoctor, UNAUTHORIZED, "Email not exists. Please register first");
    appAssert(existingDoctor.status !== "blocked", UNAUTHORIZED, "Your account has been suspended. Please contact support for more information.");
    appAssert(
      existingDoctor.isApproved,
      UNAUTHORIZED,
      "Your request is still under process . Please check your email for updates"
    );
    const isValidUser = await existingDoctor.comparePassword(doctorData.password);
    appAssert(isValidUser, UNAUTHORIZED, "Invalid Email or Password");
    const newSession = IcreateSession(existingDoctor._id as ObjectId, Role.DOCTOR, doctorData.userAgent, oneYearFromNow());
    const session = await this._sessionRepository.createSession(newSession);

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
      role: Role.DOCTOR,
    };
    const userId = existingDoctor._id as ObjectId;
    const accessToken = signToken({
      ...sessionInfo,
      userId: userId,
      role: Role.DOCTOR,
    });
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

    return {
      user: {
        _id: existingDoctor._id as ObjectId,
        name: existingDoctor.name,
        email: existingDoctor.email,
        profilePicture: existingDoctor.profilePicture,
        role: existingDoctor.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async logoutUser(payload: AccessTokenPayload) {
    await this._sessionRepository.findByIdAndDelete(payload.sessionId);
  }

  async updateDoctorDetails(userId: mongoose.Types.ObjectId, details: DoctorDetailsParams) {
    appAssert(userId, BAD_REQUEST, "Invalid userId. Please login again.");
    const doctorDetails = await this._doctorRepository.findDoctorByID(userId);
    appAssert(doctorDetails, NOT_FOUND, "User not found");
    return await this._doctorRepository.updateDoctorDetailsByDocId(userId, details);
  }

  async updatePassword({ userId, currentPassword, newPassword, role }: updatePasswordParams) {
    appAssert(currentPassword, BAD_REQUEST, "Current password is required");
    appAssert(newPassword, BAD_REQUEST, "New password is required");

    const isExistingUser = role === Role.DOCTOR
      ? await this._doctorRepository.findDoctorByID(userId)
      : await this._userRepository.findUserById(userId);

    appAssert(isExistingUser, NOT_FOUND, "User not found");

    const isValidPassword = await isExistingUser.comparePassword(currentPassword);
    appAssert(isValidPassword, BAD_REQUEST, "Current password is incorrect");

    const isSamePassword = await isExistingUser.comparePassword(newPassword);
    appAssert(!isSamePassword, BAD_REQUEST, "New password cannot be the same as the current password");
    return await this._doctorRepository.updatePassword(userId, newPassword, role);
  }

  // async googleAuth(code : string){
  //   const googleResponse = await oauth2Client.getToken(code);
  //   oauth2Client.setCredentials(googleResponse.tokens);

  //   const userRes = await axios.get(
  //     `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`
  //   );
  //   // console.log(userRes);
  //   const { email, name, picture } = userRes.data;
  //   let doctor = await this._doctorRepository.findDoctorByEmail(email);
  //   let isNewDoctor = false;
  //   if(!doctor){
  //     isNewDoctor = true;
  //     doctor = await this._doctorRepository.createDoctor({
  //       name,
  //       email,
  //       role: Role.DOCTOR,
  //       provider: "google",
  //       isVerified: true,
  //       isApproved: false
  //     });
  //   }
  // }
}
