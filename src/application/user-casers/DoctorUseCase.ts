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
import { DoctorDetailsParams, RegisterDoctorParams } from "../../domain/types/doctorTypes";
import { Doctor } from "../../domain/entities/Doctors";
import { NotificationType, OtpCodeTypes, VerificationCodeTypes } from "../../shared/constants/verficationCodeTypes";
import { getVerifyEmailTemplates } from "../../shared/utils/emialTemplates";
import { IOptverificationRepository, IOtpReposirtoryCodeToken } from "../repositories/IOtpReposirtory";
import { getPendingApprovalEmailTemplate } from "../../shared/utils/doctorEmailTemplates";
import { Notification } from "../../domain/entities/Notification";
import { INotificationRepository, INotificationRepositoryToken } from "../repositories/INotificationRepository";
import cloudinary from "../../infrastructure/config/cloudinary";
import { LoginUserParams } from "../../domain/types/userTypes";
import { Slot } from "../../domain/entities/Slot";
import { SlotType } from "../../interface/validations/slot.schema";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import { IAppointmentRepository, IAppointmentRepositoryToken } from "../repositories/IAppointmentRepository";
import { Session } from "../../domain/entities/Session";
import UserRoleTypes from "../../shared/constants/UserRole";
import { IConversationRepository, IConversationRepositoryToken } from "../repositories/IConversationRepository";
import { IcreateOtp, IcreateSession } from "../../shared/utils/builder";
import {
  ConsultationType,
  IcreateDoctorDetails,
  IcreateNotification,
  IcreateSlot,
} from "../../shared/utils/doctorHelper";

@Service()
export class DoctorUseCase {
  constructor(
    @Inject(IDoctorRepositoryToken) private doctorRepository: IDoctorRepository,
    @Inject(IVerficaitonCodeRepositoryToken) private verificationCodeRepository: IVerficaitonCodeRepository,
    @Inject(ISessionRepositoryToken) private sessionRepository: ISessionRepository,
    @Inject(IOtpReposirtoryCodeToken) private otpRepository: IOptverificationRepository,
    @Inject(INotificationRepositoryToken) private notificationRepository: INotificationRepository,
    @Inject(ISlotRepositoryToken) private slotRepository: ISlotRepository,
    @Inject(IAppointmentRepositoryToken) private appointmentRepository: IAppointmentRepository,
    @Inject(IConversationRepositoryToken) private conversationRepository: IConversationRepository
  ) {}

  async registerDoctor(details: RegisterDoctorParams) {
    const existingDoctor = await this.doctorRepository.findDoctorByEmail(details.email);
    appAssert(!existingDoctor, CONFLICT, "Email already exists");
    // create doctor
    const newDoctor = new Doctor(new mongoose.Types.ObjectId(), details.name, details.email, details.password);
    const doctor = await this.doctorRepository.createDoctor(newDoctor);
    // send verfication email
    const otpCode = IcreateOtp(doctor._id, OtpCodeTypes.EmailVerification);
    const newOtp = await this.otpRepository.saveOtp(otpCode);
    console.log("new created Otp : ", newOtp);
    // send verification email
    await sendMail({
      to: doctor.email,
      ...getVerifyEmailTemplates(newOtp.code, newDoctor.name),
    });
    //create session
    const newSession = IcreateSession(doctor._id, UserRoleTypes.DOCTOR, details.userAgent, oneYearFromNow());
    const session = await this.sessionRepository.createSession(newSession);

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
      role: UserRoleTypes.DOCTOR,
    };
    const userId = doctor._id;
    const accessToken = signToken({
      ...sessionInfo,
      userId: userId,
      role: UserRoleTypes.DOCTOR,
    });
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
    return {
      user: doctor.omitPassword(),
      accessToken,
      refreshToken,
    };
  }
  // register as doctor;
  async registerAsDoctor({ userId, details }: { userId: mongoose.Types.ObjectId; details: DoctorDetailsParams }) {
    console.log("DoctorId from registerAsDoctor handler : ", userId);
    const existingDoctor = await this.doctorRepository.findDoctorDetails(userId);
    appAssert(!existingDoctor, CONFLICT, "Email already exists");
    const doctor = await this.doctorRepository.findDoctorByID(userId);
    let doctorName;
    if (doctor) {
      doctorName = doctor.name;
    }
    console.log(doctor);
    // upload image to cloudinary>>>>>
    const uploadResponse = details.profilePicture ? await cloudinary.uploader.upload(details.profilePicture) : null;
    const doctorDetails = IcreateDoctorDetails(
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
      details.bio,
      uploadResponse?.secure_url
    );
    //add to the database;
    const newDoctorDetails = await this.doctorRepository.createDoctorDetails(doctorDetails);
    const newDoctorEmail = newDoctorDetails.professionalEmail;
    await sendMail({ to: newDoctorEmail, ...getPendingApprovalEmailTemplate() });

    // creating Notification for admin >>>>>>> later do impliment websocket
    let message = `${doctorName} has registered as a doctor and is waiting for approval.`;

    const notification = IcreateNotification(userId, NotificationType.DoctorRegistration, message);

    const new_notification = await this.notificationRepository.createNotification(notification);
    return {
      doctorDetails: newDoctorDetails,
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
    const updatedUser = await this.doctorRepository.updateUserById(valideCode!.userId, { isVerified: true });
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");
    await this.verificationCodeRepository.deleteVerificationCode(valideCode!.userId);
    return {
      user: updatedUser.omitPassword(),
    };
  }

  async verifyOtp(code: string, userId: mongoose.Types.ObjectId) {
    const validCode = await this.otpRepository.findOtpById(code, userId, OtpCodeTypes.EmailVerification);
    appAssert(validCode, NOT_FOUND, "Invalid code");
    if (validCode.expiresAt < new Date()) {
      appAssert(false, BAD_REQUEST, "OTP has expired");
    }
    const updatedUser = await this.doctorRepository.updateUserById(validCode.userId, { isVerified: true });
    appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");
    await this.otpRepository.deleteOtp(validCode._id);
    return { user: updatedUser.omitPassword() };
  }

  async loginDoctor(doctorData: LoginUserParams) {
    const existingDoctor = await this.doctorRepository.findDoctorByEmail(doctorData.email);
    appAssert(existingDoctor, UNAUTHORIZED, "Email not exists. Please register first");
    appAssert(
      existingDoctor.isApproved,
      UNAUTHORIZED,
      "Your request is still under process . Please check your email for updates"
    );
    const isValidUser = await existingDoctor.comparePassword(doctorData.password);
    appAssert(isValidUser, UNAUTHORIZED, "Invalid Email or Password");
    const newSession = IcreateSession(existingDoctor._id, UserRoleTypes.DOCTOR, doctorData.userAgent, oneYearFromNow());
    const session = await this.sessionRepository.createSession(newSession);

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
      role: UserRoleTypes.DOCTOR,
    };
    const userId = existingDoctor._id;
    const accessToken = signToken({
      ...sessionInfo,
      userId: userId,
      role: UserRoleTypes.DOCTOR,
    });
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

    return {
      doctor: existingDoctor.omitPassword(),
      accessToken,
      refreshToken,
    };
  }

  async logoutUser(payload: AccessTokenPayload) {
    await this.sessionRepository.findByIdAndDelete(payload.sessionId);
  }
  async addSlots(doctorId: mongoose.Types.ObjectId, payload: SlotType) {
    console.log(`Doctor Id: ${doctorId} and slots: ${JSON.stringify(payload)}`);
    const existingSlots = await this.slotRepository.findSlotDetails(
      doctorId,
      payload.startTime,
      payload.endTime,
      payload.date
    );
    appAssert(!existingSlots, CONFLICT, "Slot already exists");
    const { startTime, endTime } = payload;
    appAssert(startTime < endTime, BAD_REQUEST, "End time must be after start time");
    let type = payload.consultationType === "video" ? ConsultationType.Video : ConsultationType.Audio;
    const newSlot = IcreateSlot(doctorId, startTime, endTime, payload.date, type);

    const newSlotDetails = await this.slotRepository.createSlot(newSlot);
    return newSlotDetails;
  }

  async displayAllSlots(doctorId: mongoose.Types.ObjectId) {
    const slots = await this.slotRepository.findAllActiveSlots(doctorId);
    return slots;
  }

  async cancelSlot(doctorId: mongoose.Types.ObjectId, slotId: mongoose.Types.ObjectId) {
    const existingSlot = await this.slotRepository.findSlotById(slotId);
    appAssert(existingSlot?.status !== "booked", UNAUTHORIZED, "Patient has already booked this slot.");
    await this.slotRepository.deleteSlot(doctorId, slotId);
  }

  async getAllAppointment(
    doctorId: mongoose.Types.ObjectId,
    filters: { status?: string; paymentStatus?: string; consultationType?: string },
    page: number,
    limit: number
  ) {
    const { data, total } = await this.appointmentRepository.findAllAppointmentsByDocID({
      doctorId,
      filters,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit);
    return { appointments: data, total, page, totalPages };
  }

  async getAllUsers(userId: mongoose.Types.ObjectId, role: string): Promise<any> {
    const users = await this.conversationRepository.getUsers(userId, role);
    return users;
  }
}
