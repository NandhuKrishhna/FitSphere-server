import { Token } from "typedi";
import { DisplayDoctorsParams, DoctorProfile, DoctorwithDetails } from "../../../domain/types/doctorTypes";
import { NotificationQueryParams, TransactionQueryParams, WalletTransactionQuery } from "../../../domain/types/queryParams.types";
import { ReviewsAndRatingParams } from "../../../domain/types/reviewsAndrating";
import { TransactionsResponse } from "../../../domain/types/transaction.types";
import { INotification } from "../../../infrastructure/models/notification.models";
import { IRating } from "../../../infrastructure/models/RatingsModel";
import { IReview } from "../../../infrastructure/models/ReviewModel";
import { ITransaction } from "../../../infrastructure/models/transactionModel";
import { ObjectId, UserDocument } from "../../../infrastructure/models/UserModel";
import { WalletDocument } from "../../../infrastructure/models/walletModel";
import { IReviewAndRatingResponse, ISubscriptionDetails } from "../interface-types/UseCase-types";
import mongoose from "mongoose";
import { SlotDocument } from "../../../infrastructure/models/slot.models";

export interface IAppUseCase {
    displayAllDoctors(
        {
            page,
            limit,
            search,
            sort,
            gender,
            specialty,
            language,
            experience,
        }: DisplayDoctorsParams
    ): Promise<{
        doctors: DoctorwithDetails[];
        total: number;
    }>

    updateProfile(userId: ObjectId, profilePic: string): Promise<UserDocument>;
    displayDoctorDetails(doctorId: ObjectId): Promise<DoctorProfile>;
    getSlots(doctorId: mongoose.Types.ObjectId): Promise<SlotDocument[]>;
    getWalletDetails(useId: ObjectId, role: string, queryParams: WalletTransactionQuery): Promise<WalletDocument | null>;
    getNotifications(userId: ObjectId, role: string, queryParams: NotificationQueryParams): Promise<{
        notifications: INotification[];
        currentPage: number;
        totalPages: number;
        totalNotifications: number;
    }>;
    reviewAndRating(
        {
            userId,
            doctorId,
            rating,
            reviewText
        }: ReviewsAndRatingParams): Promise<IReviewAndRatingResponse>
    fetchReviewsAndRating(doctorId: ObjectId): Promise<{ reviews: IReview[]; rating: IRating | null }>
    getAllRatings(): Promise<IRating[]>
    markAsReadNotification(notificationId: ObjectId): Promise<void>;
    getTransactions(userId: ObjectId): Promise<ITransaction[]>;
    editReview(
        {
            userId,
            doctorId,
            rating,
            reviewText,
            reviewId
        }: ReviewsAndRatingParams): Promise<void>;
    deleteReview(doctorId: ObjectId, reviewId: ObjectId, userId: ObjectId): Promise<void>
    fetchTransactions(
        userId: ObjectId,
        queryParams: TransactionQueryParams,
        role: string): Promise<TransactionsResponse>
    getSubscriptionDetails(useId: ObjectId): Promise<ISubscriptionDetails | null>

}


export const IAppUseCaseToken = new Token<IAppUseCase>();