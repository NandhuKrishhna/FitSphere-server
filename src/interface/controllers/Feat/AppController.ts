import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { BAD_REQUEST, OK } from "../../../shared/constants/http";
import appAssert from "../../../shared/utils/appAssert";
import { Inject, Service } from "typedi";
import { AppUseCase } from "../../../application/user-cases/AppUseCase";
import { stringToObjectId } from "../../../shared/utils/bcrypt";

import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import { NotificationQueryParams, TransactionQueryParams, WalletTransactionQuery } from "../../../domain/types/queryParams.types";
import { IAppController } from "../../controllerInterface/IAppController";
import { IAdminControllerToken } from "../../controllerInterface/IAdminController";



@Service()
export class AppController implements IAppController {
  constructor(@Inject() private _appUseCase: AppUseCase) { }

  displayAllDoctorsHandler = catchErrors(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) - 1 : 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
    const search = req.query.search ? (req.query.search as string).trim() : "";
    let sort = req.query.sort ? (req.query.sort as string).split(",") : ["_id"];

    // Extract filter parameters
    const gender = req.query.gender ? (req.query.gender as string).split(",") : [];
    const specialty = req.query.specialty ? (req.query.specialty as string).split(",") : [];
    const language = req.query.language ? (req.query.language as string).split(",") : [];
    const experience = req.query.experience ? parseInt(req.query.experience as string) : 0;

    const { doctors, total } = await this._appUseCase.displayAllDoctors({
      page,
      limit,
      search,
      sort,
      gender,
      specialty,
      language,
      experience,
    });

    return res.status(OK).json({
      success: true,
      message: "Doctors fetched successfully",
      doctors,
      pagination: {
        total,
        currentPage: page + 1,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  });

  updateProfileHandler = catchErrors(async (req: Request, res: Response) => {
    const { profilePic } = req.body;
    appAssert(profilePic, BAD_REQUEST, "Profile picture is required");
    const { userId } = req as AuthenticatedRequest;

    const user = await this._appUseCase.updateProfile(userId, profilePic);
    res.status(OK).json({
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  });

  // display doctor details in the user side
  doctorDetailsHandler = catchErrors(async (req: Request, res: Response) => {
    const doctorId = stringToObjectId(req.body.doctorId);
    appAssert(doctorId, BAD_REQUEST, "Doctor Id is required");
    const doctorDetails = await this._appUseCase.displayDoctorDetails(doctorId);
    res.status(OK).json({
      success: true,
      message: "Doctor details fetched successfully",
      doctorDetails,
    });
  });

  getSlotsHandler = catchErrors(async (req: Request, res: Response) => {
    const doctorId = stringToObjectId(req.body.doctorId);
    appAssert(doctorId, BAD_REQUEST, "Doctor Id is required");
    const slots = await this._appUseCase.getSlots(doctorId);
    res.status(OK).json({
      success: true,
      message: "Slots fetched successfully",
      slots,
    });
  });

  getWalletHandler = catchErrors(async (req: Request, res: Response) => {
    const queryParams: WalletTransactionQuery = req.query as WalletTransactionQuery;
    const userId = stringToObjectId(req.params.userId);
    const { role } = req as AuthenticatedRequest
    const response = await this._appUseCase.getWalletDetails(userId, role, queryParams);
    res.status(OK).json({
      success: true,
      message: "Wallet details fetched successfully",
      response,
    });
  });

  getNotificationsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId, role } = req as AuthenticatedRequest;
    const queryParams: NotificationQueryParams = req.query;
    const allNotifications = await this._appUseCase.getNotifications(userId, role, queryParams);
    res.status(OK).json({
      success: true,
      message: "Notifications fetched successfully",
      allNotifications,
    });
  });

  // review and rating;
  reviewAndRatingHandler = catchErrors(async (req: Request, res: Response) => {
    const { rating, reviewText } = req.body;
    const doctorId = stringToObjectId(req.body.doctorId);
    const { userId } = req as AuthenticatedRequest;
    const { review, doctorReviews } = await this._appUseCase.reviewAndRating({ userId, doctorId, rating, reviewText });
    res.status(OK).json({
      success: true,
      message: "Review and rating added successfully",
      reviewId: doctorReviews._id,
    });
  });

  fetchReviewsAndRatingHandler = catchErrors(async (req: Request, res: Response) => {
    const doctorId = stringToObjectId(req.params.doctorId as string);
    appAssert(doctorId, BAD_REQUEST, "Doctor Id is required");
    const { reviews, rating } = await this._appUseCase.fetchReviewsAndRating(doctorId);
    res.status(OK).json({
      success: true,
      message: "Reviews and rating fetched successfully",
      response: {
        reviews,
        averageRating: rating?.averageRating || 0,
        totalReviews: rating?.totalReviews || 0,
      },
    });
  });

  getAllRatingsHandler = catchErrors(async (req: Request, res: Response) => {
    const response = await this._appUseCase.getAllRatings();
    res.status(OK).json({
      success: true,
      message: "All reviews fetched successfully",
      response,
    });
  });

  markAsReadNotificationHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const notificationId = stringToObjectId(req.body.notificationId);
    appAssert(notificationId, BAD_REQUEST, "No Notification was found");
    await this._appUseCase.markAsReadNotification(notificationId);
    res.status(OK).json({
      success: true,
      message: "Notification marked as read successfully",
    })
  });

  getAllTransactionsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const transactions = await this._appUseCase.getTransactions(userId);
    res.status(OK).json({
      success: true,
      message: "Transactions fetched successfully",
      transactions
    })
  })

  editReviewHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { rating, reviewText } = req.body;
    const doctorId = stringToObjectId(req.body.doctorId);
    const reviewId = stringToObjectId(req.body.reviewId);
    await this._appUseCase.editReview({ userId, doctorId, rating, reviewText, reviewId });
    res.status(OK).json({
      success: true,
      message: "Review and rating edited successfully",
    });
  })

  deleteReviewHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const doctorId = stringToObjectId(req.body.doctorId);
    const reviewId = stringToObjectId(req.body.reviewId);
    await this._appUseCase.deleteReview(doctorId, reviewId, userId);
    res.status(OK).json({
      success: true,
      message: "Review deleted successfully",
    })
  })


  fetchTransactionHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId, role } = req as AuthenticatedRequest;
    const queryParams: TransactionQueryParams = req.query;
    const response = await this._appUseCase.fetchTransactions(userId, queryParams, role);
    res.status(OK).json({
      success: true,
      message: "Transactions fetched successfully",
      ...response
    })
  });


  getSubscriptionDetailsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const response = await this._appUseCase.getSubscriptionDetails(userId);
    res.status(OK).json({
      success: true,
      message: "Subscription details fetched successfully",
      response
    })
  })

}
