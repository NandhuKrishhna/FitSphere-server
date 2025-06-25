import { Token } from "typedi";
import { LoginUserParams } from "../../../domain/types/userTypes";
import { DoctorStats, IAdminDashBoardResponse, IAdminLoginResponse, SubcriptionParams, UserStats } from "../interface-types/UseCase-types";
import { DoctorQueryParams, UserQueryParams } from "../../../domain/types/queryParams.types";
import { AccessTokenPayload } from "../../../shared/utils/jwt";
import { PaginatedDoctors, PaginatedUsers } from "../../../infrastructure/repositories/AdminRepository";
import { INotification } from "../../../infrastructure/models/notification.models";
import { ObjectId, UserDocument } from "../../../infrastructure/models/UserModel";
import { DoctorDocument } from "../../../infrastructure/models/DoctorModel";
import { LookUpDoctor } from "../../../domain/types/doctorTypes";
import { IPremiumSubscription } from "../../../infrastructure/models/premiumSubscriptionModel";
import { WalletDocument } from "../../../infrastructure/models/walletModel";

export interface IAdminUseCase {
    adminLogin(adminData: LoginUserParams): Promise<IAdminLoginResponse>
    getAllUsers(queryParams: UserQueryParams): Promise<PaginatedUsers | null>;
    getAllDoctors(queryParams: DoctorQueryParams): Promise<PaginatedDoctors | null>;
    logoutAdmin(payload: AccessTokenPayload): Promise<void>;
    getNotification(): Promise<INotification[]>;
    approveRequest(id: ObjectId): Promise<DoctorDocument | null>;
    rejectRequest(id: ObjectId, reason: string): Promise<void>;
    findAllDoctorsDetails(): Promise<LookUpDoctor | null>;
    unblockUser(id: ObjectId, role: string): Promise<UserDocument | DoctorDocument | null>;
    blockUser(id: ObjectId, role: string): Promise<UserDocument | DoctorDocument | null>;
    addingPremiumSubscription({
        userId,
        type,
        price,
        features,
        planName
    }: SubcriptionParams): Promise<IPremiumSubscription>;
    editPremiumSubscription({
        type,
        price,
        features,
        planName
    }: SubcriptionParams,
        subscriptionId: ObjectId): Promise<IPremiumSubscription | null>;
    deletePremiumSubscription(subscriptionId: ObjectId): Promise<void>;
    getAllPremiumSubscription(): Promise<IPremiumSubscription[]>;
    adminDashboard(userId: ObjectId): Promise<{
        doctorDetails: DoctorStats;
        userDetails: UserStats;
        walletDetails: WalletDocument | null;
    }>


}

export const IAdminUseCaseToken = new Token<IAdminUseCase>();