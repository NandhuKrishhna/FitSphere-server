import { Inject, Service } from "typedi";
import { DoctorDetailsParams, RegisterDoctorParams } from "../../domain/types/doctorTypes";
import appAssert from "../../shared/utils/appAssert";
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../../shared/constants/http";
import { Doctor } from "../../domain/entities/Doctors";
import mongoose from "mongoose";
import {
  IDoctorRepository,
  IDoctorRepositoryToken,
} from "../repositories/IDoctorRepository";
import VerificationCodeTypes from "../../shared/constants/verficationCodeTypes";
import { oneYearFromNow } from "../../shared/utils/date";
import { VerificationCode } from "../../domain/entities/VerificationCode";
import {
  IVerficaitonCodeRepository,
  IVerficaitonCodeRepositoryToken,
} from "../repositories/IVerificaitonCodeRepository";
import { APP_ORIGIN } from "../../shared/constants/env";
import { sendMail } from "../../shared/constants/sendMail";
import {
  ISessionRepository,
  ISessionRepositoryToken,
} from "../repositories/ISessionRepository";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
} from "../../shared/utils/jwt";
import { getVerifyEmailTemplates } from "../../shared/utils/EmailTemplates/VerifyEmailTemplate";
import { DoctorDetails } from "../../domain/entities/DoctorDetails";
import { send } from "process";
import { getPendingApprovalEmailTemplate } from "../../shared/utils/EmailTemplates/registration.confirmation";

@Service()
export class DoctorUseCase {
  constructor(
    @Inject(IDoctorRepositoryToken) private doctorRepository: IDoctorRepository,
    @Inject(IVerficaitonCodeRepositoryToken) private  verificationCodeRepository: IVerficaitonCodeRepository,
    @Inject(ISessionRepositoryToken) private sessionRepository: ISessionRepository
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
    const verificationCode: VerificationCode = new VerificationCode(
      doctor._id,
      VerificationCodeTypes.EmailVerficaton,
      oneYearFromNow()
    );
    const verficationEmailCode =
      await this.verificationCodeRepository.createVerificationCode(
        verificationCode
      );
    const url = `${APP_ORIGIN}/email/verify/${verficationEmailCode._id}`;
    // send verification email
    await sendMail({
      to: doctor.email,
      ...getVerifyEmailTemplates(url),
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
    //sign access token and refresh token
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

    // add doctor details
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
      details.secondarySpecialties,
      details.areasOfExpertise,
      details.specificTreatmentFocuses,
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
      ...getPendingApprovalEmailTemplate ("nandhu", "nandhukrishna@gmail.com")
     })
     return {
      doctorDetails: newDoctorDetails,}
    }

    //verify email
    async verifyEmail(code: string) {
      const valideCode = await this.verificationCodeRepository.findVerificationCode(code, VerificationCodeTypes.EmailVerficaton);
      appAssert(valideCode, NOT_FOUND , "Invalid or expired verification code");
     
      //update user to verified true
      const updatedUser = await this.doctorRepository.updateUserById(valideCode!.userId, {isVerified:true});
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");
    await this.verificationCodeRepository.deleteVerificationCode(valideCode!.userId);
  return {
    user: updatedUser.omitPassword(),
  }
  }

}