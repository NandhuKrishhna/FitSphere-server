import { Inject, Service } from "typedi";
import { LoginUserParams } from "../../domain/types/userTypes";
import { IAdminRepository, IAdminRepositoryToken } from "../repositories/IAdminRepository";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, UNAUTHORIZED } from "../../shared/constants/http";
import mongoose from "mongoose";
import { oneYearFromNow } from "../../shared/utils/date";
import { ISessionRepository, ISessionRepositoryToken } from "../repositories/ISessionRepository";
import { AccessTokenPayload, RefreshTokenPayload, refreshTokenSignOptions, signToken } from "../../shared/utils/jwt";
import { INotificationRepository, INotificationRepositoryToken } from "../repositories/INotificationRepository";
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";
import { sendMail } from "../../shared/constants/sendMail";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { getRejectionEmailTemplate } from "../../shared/utils/EmailTemplates/RequestRejectEmailTemplate";
import { getApprovalEmailTemplate } from "../../shared/utils/EmailTemplates/DoctorApprovalTemplate";
import Role from "../../shared/constants/UserRole";
import { IcreateSession } from "../../shared/utils/builder";
import { IWalletRepository, IWalletRepositoryToken } from "../repositories/IWalletRepository";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { NotificationType } from "../../shared/constants/verificationCodeTypes";
import { getReceiverSocketId } from "../../infrastructure/config/socket.io";
import { emitNotification, suspendNotification } from "../../shared/utils/emitNotification";
import { DoctorQueryParams, UserQueryParams } from "../../domain/types/queryParams.types";
import { IPremiumSubscriptionRepository, IPremiumSubscriptionRepositoryToken } from "../repositories/IPremiumSubscription";
import { SubcriptionParams } from "./interface-types/UseCase-types";
import { IAdminUseCase, IAdminUseCaseToken } from "./interface/IAdminUseCase";
import { INotification } from "../../infrastructure/models/notification.models";

@Service()
export class AdminUseCase implements IAdminUseCase {
  constructor(
    @Inject(IAdminRepositoryToken) private _adminRepository: IAdminRepository,
    @Inject(ISessionRepositoryToken) private _sessionRepository: ISessionRepository,
    @Inject(INotificationRepositoryToken) private __notificationRepository: INotificationRepository,
    @Inject(IDoctorRepositoryToken) private _doctorRepository: IDoctorRepository,
    @Inject(IUserRepositoryToken) private _userRepository: IUserRepository,
    @Inject(IWalletRepositoryToken) private _walletRespository: IWalletRepository,
    @Inject(IPremiumSubscriptionRepositoryToken) private _premiumSubscriptionRepository: IPremiumSubscriptionRepository,
  ) { }

  // method for admin login
  async adminLogin(adminData: LoginUserParams) {
    const existingUser = await this._adminRepository.findAdminByEmail(adminData.email);
    appAssert(existingUser, UNAUTHORIZED, "Invalid email or user does not exist");
    const isValid = await existingUser.comparePassword(adminData.password);
    appAssert(isValid, UNAUTHORIZED, "Invalid email or password!");
    const newSession = IcreateSession(existingUser._id, Role.ADMIN, adminData.userAgent, oneYearFromNow());
    const session = await this._sessionRepository.createSession(newSession);

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id ?? new mongoose.Types.ObjectId(),
      role: session.role,
    };
    const adminID = existingUser._id;
    const accessToken = signToken({
      ...sessionInfo,
      userId: adminID,
      role: session.role,
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

  async getAllUsers(queryParams: UserQueryParams) {
    const users = await this._adminRepository.getAllUsers(queryParams);
    return users;
  }

  async getAllDoctors(queryParams: DoctorQueryParams) {
    const doctors = await this._adminRepository.getAllDoctors(queryParams);
    return doctors;
  }

  async logoutAdmin(payload: AccessTokenPayload) {
    await this._sessionRepository.findByIdAndDelete(payload.sessionId);
  }
  async getNotification(): Promise<INotification[]> {
    const type: string[] = [NotificationType.DoctorRegistration];
    const notification = await this.__notificationRepository.getAllNotifications(type);
    return notification;
  }

  async approveRequest(id: mongoose.Types.ObjectId) {
    const user = await this._doctorRepository.findDoctorByID(id);
    appAssert(user, BAD_REQUEST, "User not found . Please try again");
    appAssert(!user.isApproved, BAD_REQUEST, "User is already approved");
    const approvedDoctor = await this._adminRepository.approveRequest(id);
    await this._walletRespository.createWallet({
      userId: user._id as ObjectId,
      role: "Doctor"
    });
    await this.__notificationRepository.deleteNotification(id);
    await sendMail({
      to: user.name,
      ...getApprovalEmailTemplate(user.name, user.email),
    });
    return approvedDoctor;
  }

  async rejectRequest(id: mongoose.Types.ObjectId, reason: string) {
    const response = await this._adminRepository.rejectRequest(id);
    appAssert(response, BAD_REQUEST, "Unable to Reject Request . Please try again after few minutes");
    appAssert(response.isApproved, BAD_REQUEST, "User's request was already rejected");
    await this._doctorRepository.deleteDoctorById(id);
    await this._doctorRepository.deleteDoctorDetails(id);
    await this.__notificationRepository.deleteNotification(id);
    await sendMail({
      to: response.email,
      ...getRejectionEmailTemplate(response.name, reason),
    });
  }

  async findAllDoctorsDetails() {
    const result = await this._adminRepository.doctorDetails();
    return result;
  }

  async unblockUser(id: mongoose.Types.ObjectId, role: string) {
    const user = role === Role.USER ? await this._userRepository.findUserById(id) : await this._doctorRepository.findDoctorByID(id);
    appAssert(user?.status !== "active", BAD_REQUEST, "User is already active");
    const response = await this._adminRepository.unblockById(id, role);
    return response;

  }

  async blockUser(id: mongoose.Types.ObjectId, role: string) {
    const user = role === Role.USER ? await this._userRepository.findUserById(id) : await this._doctorRepository.findDoctorByID(id);
    appAssert(user?.status !== "blocked", BAD_REQUEST, "User is already blocked");
    const response = await this._adminRepository.blockById(id, role);
    appAssert(response, BAD_REQUEST, "User was not found. Or error in blocking the user");
    if (response) {
      await this._sessionRepository.deleteMany(id);
    }
    const userSocketId = getReceiverSocketId(user?._id);
    suspendNotification(userSocketId, "Your account has been suspended. Please contact with our team");
    return response;
  }
  async addingPremiumSubscription({ userId, type, price, features, planName }: SubcriptionParams) {
    return await this._premiumSubscriptionRepository.createSubscription({
      type,
      price,
      features,
      planName
    })
  }

  async editPremiumSubscription({ type, price, features, planName }: SubcriptionParams, subscriptionId: mongoose.Types.ObjectId) {
    console.log("-----------------------")
    return await this._premiumSubscriptionRepository.editPremiumSubscription(subscriptionId, {
      type,
      price,
      features,
      planName
    })
  }

  async deletePremiumSubscription(subscriptionId: ObjectId) {
    const existingSubscriptionPlan = await this._premiumSubscriptionRepository.getSubscriptionById(subscriptionId);
    appAssert(existingSubscriptionPlan, BAD_REQUEST, "Subscription not found. Please try again.");
    await this._premiumSubscriptionRepository.deletePremiumSubscription(subscriptionId);
  }

  async getAllPremiumSubscription() {
    return await this._premiumSubscriptionRepository.getAllPremiumSubscription();
  }
  async adminDashboard(userId: ObjectId) {
    const userDetails = await this._userRepository.userDetails();
    const doctorDetails = await this._doctorRepository.getDoctorStatistics();
    const walletDetails = await this._walletRespository.findWalletById(userId, "Admin")
    return {
      doctorDetails,
      userDetails,
      walletDetails
    }
  }

}