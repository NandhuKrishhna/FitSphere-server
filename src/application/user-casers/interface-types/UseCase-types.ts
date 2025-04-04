import mongoose from "mongoose";
import { IRating } from "../../../infrastructure/models/RatingsModel";
import { IReview } from "../../../infrastructure/models/ReviewModel";
import { ObjectId, UserDocument } from "../../../infrastructure/models/UserModel";
import { WalletDocument } from "../../../infrastructure/models/walletModel";
import { IChat } from "../../../infrastructure/models/chatModel";
import { AppointmentDocument } from "../../../infrastructure/models/appointmentModel";
import { SlotDocument } from "../../../infrastructure/models/slot.models";
import { DoctorDocument } from "../../../infrastructure/models/DoctorModel";
import { INotification } from "../../../infrastructure/models/notification.models";
import { DoctorDetailsDocument } from "../../../infrastructure/models/doctor.details.model";
import { PaginatedDoctors, PaginatedUsers } from "../../../infrastructure/repositories/AdminRepository";
import { LookUpDoctor } from "../../../domain/types/doctorTypes";
import { IPremiumSubscription } from "../../../infrastructure/models/premiumSubscriptionModel";

export interface IAdminLoginResponse {
    user: ILoginUser
    accessToken: string;
    refreshToken: string;
}
export interface ILoginUser {
    _id: ObjectId;
    name: string;
    email: string;
    profilePicture: string;
    role: string;
};
export interface IAdminDashBoardResponse {
    doctorDetails: DoctorStats;
    userDetails: UserStats;
    walletDetails: WalletDocument | null;
}

export interface UserStats {
    totalUsers: number;
    blockedUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    premiumUsers: number;
    normalUsers: number;
};

export interface DoctorStats {
    totalDoctors: number;
    approvedDoctors: number;
    verifiedDoctors: number;
    topDoctors: TopDoctor[];
}

export interface TopDoctor {
    _id: string;
    name: string;
    email: string;
    profilePicture: string;
    averageRating: number;
    totalReviews: number;
}

export type SubcriptionParams = {
    userId?: ObjectId,
    type: string,
    price: number,
    features: string[]
    planName: string
}

export type WalletParams = {
    userId: ObjectId;
    type?: "basic" | "premium" | "enterprise";
    usecase: string;
    doctorId?: ObjectId;
    slotId?: ObjectId;
    amount: number;
    patientId?: ObjectId;
};
export type MarkAsReadNotificationParams = {
    userId: ObjectId,
    notificationId: ObjectId
};

export interface IReviewAndRatingResponse {
    review: IRating;
    doctorReviews: IReview
};

export interface ISubscriptionDetails {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    subscriptionId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: string;
    planName: string;
    type: string;
    price: number;
    features: string[];
}
export interface INutrient {
    nutrientName: string;
    value: number;
}

export interface IFood {
    description: string;
    foodNutrients: INutrient[];
}

export interface INutrientValues {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
}

export interface IFoodItems extends INutrientValues {
    name: string;
    quantity: string;
}

export interface INutrient {
    nutrientName: string;
    value: number;
}

export interface IFood {
    description: string;
    foodNutrients: INutrient[];
}

export interface INutrientValues {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
}

export interface IFoodItemResponse extends INutrientValues {
    name: string;
    quantity: string;
}
export interface IGetMessageResposne {
    messages: IChat[];
    conversationId: mongoose.Types.ObjectId;
};

export interface IProfilePageDetailsResponse {
    appointments: AppointmentDocument[];
    slots: SlotDocument[];
};

export interface IRegisterAsDoctorResponse {
    doctorDetails: DoctorDetailsDocument
    notification: INotification
};

export interface ILoginDoctorResponse {
    doctor: DoctorDocument;
    accessToken: string;
    refreshToken: string;
};

export interface IUserAppointmentBookingResponse {
    newAppointmentDetails: AppointmentDocument
    order: {
        id: string;
        amount: string | number;
        currency: string
    }
    transactionId: string
};

export interface IBuyPremiumSubscription {
    order: {
        id: string;
        amount: string | number;
        currency: string;
        subscriptionId: ObjectId
    }
};

export interface IResendVerificationCodeResponse {
    otpCode: string;
    user: UserDocument | DoctorDocument
};

export interface IUserLoginResponse {
    success: boolean;
    message: string;
    resposne: {
        user: ILoginUser;
        accessToken: string;
    }
};

export interface IGetAllUsersResponse {
    success: boolean;
    users: PaginatedUsers | null
};
export interface IGetAllDoctorsResponse {
    success: boolean;
    doctors: PaginatedDoctors | null
};
export interface IUserLogoutResponse {
    message: string
};
export interface IGetAllNotificationsResponse {
    success: boolean;
    notifications: INotification[]
};

export interface IApproveDoctorResponse {
    success: boolean;
    message: string;
    newDoctor: DoctorDocument | null
};

export interface IRejectDoctorResponse {
    success: boolean;
    message: string;
};

export interface INotificationResponse {
    success: boolean;
    message: string;
    doctorsWithDetails: LookUpDoctor | null
};
export interface IBlockUserResponse {
    success: boolean;
    message: string;
    updatedUser: DoctorDocument | UserDocument
};

export interface IUnBlockUserResponse {
    success: boolean;
    message: string;
    updatedUser: DoctorDocument | UserDocument | null
};


export interface IAddPremiumSubscriptionResponse {
    success: boolean;
    message: string;
    newPremiumSubscription: IPremiumSubscription
};

export interface IEditPreiumSubscriptionResponse {
    success: boolean;
    message: string;
    updatedPremiumSubscription: IPremiumSubscription | null
};

export interface IDeletePremiumSubscriptionResponse {
    success: boolean;
    message: string;
}

export interface IGetAllSubscriptionsResponse {
    success: boolean;
    subscriptions: IPremiumSubscription[]
};

export interface IAdminDashBoardResponse {
    success: boolean;
    response: {
        doctorDetails: DoctorStats;
        userDetails: UserStats;
        walletDetails: WalletDocument | null;
    }
}