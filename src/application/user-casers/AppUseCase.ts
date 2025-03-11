import mongoose from "mongoose";
import cloudinary from "../../infrastructure/config/cloudinary";
import { DisplayDoctorsParams } from "../../domain/types/doctorTypes";
import { Inject, Service } from "typedi";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../../shared/constants/http";

import { IAppointmentRepository, IAppointmentRepositoryToken } from "../repositories/IAppointmentRepository";
import { IWalletRepository, IWalletRepositoryToken } from "../repositories/IWalletRepository";
import { INotificationRepository, INotificationRepositoryToken } from "../repositories/INotificationRepository";

import { ObjectId } from "../../infrastructure/models/UserModel";

export type WalletParams = {
  userId: ObjectId;
  type?: "basic" | "premium" | "enterprise";
  usecase: string;
  doctorId?: ObjectId;
  slotId?: ObjectId;
  amount: number;
  patientId?: ObjectId;
};
@Service()
export class AppUseCase {
  constructor(
    @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
    @Inject(IDoctorRepositoryToken)
    private doctorRespository: IDoctorRepository,
    @Inject(ISlotRepositoryToken) private slotRespository: ISlotRepository,
    @Inject(IAppointmentRepositoryToken)
    private appointmentRepository: IAppointmentRepository,
    @Inject(IWalletRepositoryToken) private walletRepository: IWalletRepository,
    @Inject(INotificationRepositoryToken) private notificationRepository: INotificationRepository
  ) {}
  async displayAllDoctors({
    page,
    limit,
    search,
    sort,
    gender,
    specialty,
    language,
    experience,
  }: DisplayDoctorsParams) {
    let sortBy: Record<string, string> = {};

    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "asc";
    }

    const doctors = await this.doctorRespository.fetchAllDoctors({
      page,
      limit,
      search,
      sortBy,
      gender,
      specialty,
      language,
      experience,
    });
    return doctors;
  }

  async updateProfile(userId: mongoose.Types.ObjectId, profilePic: string) {
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await this.userRepository.updateProfile(userId, uploadResponse.secure_url);
    appAssert(updatedUser, BAD_REQUEST, "Failed to update profile");
    return updatedUser;
  }

  async displayDoctorDetails(doctorId: mongoose.Types.ObjectId) {
    const details = await this.doctorRespository.fetchDoctorandDetailsById(doctorId);
    appAssert(details, BAD_REQUEST, "Doctor details not found");
    return details;
  }

  async getSlots(doctorId: mongoose.Types.ObjectId) {
    const slots = await this.slotRespository.findAllActiveSlots(doctorId);
    appAssert(slots, NOT_FOUND, "No slots found. Please try another slot.");
    return slots;
  }

  async displaySlotWithDoctorDetails(userId: mongoose.Types.ObjectId) {
    const details = await this.appointmentRepository.findDetailsByPatientId(userId);
    appAssert(details, BAD_REQUEST, "Unable to fetch order details. Please try few minutes later.");
    return details;
  }

  async getWalletDetails(userId: mongoose.Types.ObjectId) {
    const details = await this.walletRepository.getWalletDetailsById(userId, {});
    return details;
  }
  async getNotifications(userId: mongoose.Types.ObjectId) {
    const details = await this.notificationRepository.getAllNotificationById(userId);
    appAssert(details, BAD_REQUEST, "Unable to fetch notifications. Please try few minutes later.");
    return details;
  }
}
