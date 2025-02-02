import { Inject, Service } from "typedi";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../../shared/constants/http";
import mongoose from "mongoose";
import { generateOtpExpiration, oneYearFromNow } from "../../shared/utils/date";
import { IVerficaitonCodeRepository, IVerficaitonCodeRepositoryToken } from "../repositories/IVerificaitonCodeRepository";
import { sendMail } from "../../shared/constants/sendMail";
import { ISessionRepository, ISessionRepositoryToken } from "../repositories/ISessionRepository";
import { RefreshTokenPayload, refreshTokenSignOptions, signToken } from "../../shared/utils/jwt";
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";
import { DoctorDetailsParams, RegisterDoctorParams } from "../../domain/types/doctorTypes";
import { Doctor } from "../../domain/entities/Doctors";
import { OtpCodeTypes, VerificationCodeTypes } from "../../shared/constants/verficationCodeTypes";
import { getVerifyEmailTemplates } from "../../shared/utils/emialTemplates";
import { DoctorDetails } from "../../domain/entities/DoctorDetails";
import { Otp } from "../../domain/entities/Otp";
import { generateOTP } from "../../shared/utils/otpGenerator";
import { IOptverificationRepository, IOtpReposirtoryCodeToken } from "../repositories/IOtpReposirtory";
import { getPendingApprovalEmailTemplate } from "../../shared/utils/doctorEmailTemplates";


@Service()
export class DoctorUseCase {
  constructor(
    @Inject(IDoctorRepositoryToken) private doctorRepository: IDoctorRepository,
    @Inject(IVerficaitonCodeRepositoryToken) private  verificationCodeRepository: IVerficaitonCodeRepository,
    @Inject(ISessionRepositoryToken) private sessionRepository: ISessionRepository,
    @Inject(IOtpReposirtoryCodeToken) private otpRepository: IOptverificationRepository
  ) {}

  async registerDoctor(details: RegisterDoctorParams) {
    const existingDoctor = await this.doctorRepository.findDoctorByEmail(
      details.email
    );
    appAssert(!existingDoctor, CONFLICT, "Email already exists");
    // create doctor
    const newDoctor = new Doctor(
      new mongoose.Types.ObjectId(),
      details.name,
      details.email,
      details.password
    );
    const doctor = await this.doctorRepository.createDoctor(newDoctor);
    // send verfication email
const otpCode: Otp = new Otp(
      new mongoose.Types.ObjectId(),
      newDoctor._id,
      generateOTP(),
      VerificationCodeTypes.EmailVerification,
      generateOtpExpiration()
    );
    const newOtp = await this.otpRepository.saveOtp(otpCode);
    console.log("new created Otp : ", newOtp);
    // send verification email
    await sendMail({
      to: doctor.email,
      ...getVerifyEmailTemplates(newOtp.code, newDoctor.name),
    });
    //create session
    const newSession = {
      userId: new mongoose.Types.ObjectId(doctor._id),
      userAgent: details.userAgent,
      createdAt: new Date(),
      expiresAt: oneYearFromNow(),
    };
    const session = await this.sessionRepository.createSession(newSession);
    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
    };
    const userId = doctor._id;
    const accessToken = signToken({
      ...sessionInfo,
      userId: userId,
    });
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
    return {
      user: doctor.omitPassword(),
      accessToken,
      refreshToken,
    };
  }
  // register as doctor;
  async registerAsDoctor({userId,details}: {userId:mongoose.Types.ObjectId , details: DoctorDetailsParams}) {
    console.log("DoctorId from registerAsDoctor handler : ",userId);
    const existingDoctor = await this.doctorRepository.findDoctorDetails(userId);
    appAssert(!existingDoctor, CONFLICT, "Email already exists");
    const doctorDetails = new DoctorDetails(
      new mongoose.Types.ObjectId(),
      userId,
      details.experience,
      details.consultationFees,
      details.contactPhoneNumber,
      details.professionalEmail,
      details.officeAddress,
      details.clinicLocations,
      details.consultationLanguages,
      details.primarySpecialty,
      details.medicalLicenseNumber,
      details.gender,
      details.professionalTitle,
      details.profilePicture,
      details.bio
    )
    //add to the database;
    const newDoctorDetails = await this.doctorRepository.createDoctorDetails(doctorDetails);
    const newDoctorEmail = newDoctorDetails.professionalEmail;
     await sendMail({to: newDoctorEmail,
      ...getPendingApprovalEmailTemplate()
     })
     return {
      doctorDetails: newDoctorDetails,}
    }

    //verify email
    async verifyEmail(code: string) {
    const valideCode = await this.verificationCodeRepository.findVerificationCode(code, VerificationCodeTypes.EmailVerification);
    appAssert(valideCode, NOT_FOUND , "Invalid or expired verification code");
    const updatedUser = await this.doctorRepository.updateUserById(valideCode!.userId, {isVerified:true});
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");
    await this.verificationCodeRepository.deleteVerificationCode(valideCode!.userId);
    return {
    user: updatedUser.omitPassword(),
  }
  }

  async verifyOtp(code: string,  userId: string) {
    const validCode = await this.otpRepository.findOtpById(
      code,
      userId,
      OtpCodeTypes.EmailVerficaton
    );
    appAssert(validCode, NOT_FOUND, "Invalid code");
    if (validCode.expiresAt < new Date()) {
      appAssert(false, BAD_REQUEST, "OTP has expired");
    }
    const updatedUser = await this.doctorRepository.updateUserById(validCode.userId,{ isVerified: true });
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");
    await this.otpRepository.deleteOtp(validCode._id);
    return {user: updatedUser.omitPassword() };
  }

}