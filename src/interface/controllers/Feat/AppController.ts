import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { BAD_REQUEST, CREATED, OK } from "../../../shared/constants/http";
import appAssert from "../../../shared/utils/appAssert";
import { Inject, Service } from "typedi";
import { AppUseCase } from "../../../application/user-casers/AppUseCase";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import logger from "../../../shared/utils/logger";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";

@Service()
export class AppController {
  constructor(@Inject() private appUseCase: AppUseCase) {}

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

    const { doctors, total } = await this.appUseCase.displayAllDoctors({
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

    const user = await this.appUseCase.updateProfile(userId, profilePic);
    res.status(OK).json({
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  });

  // display doctor details in the user side
  doctorDetailsHandler = catchErrors(async (req: Request, res: Response) => {
    const doctorId = stringToObjectId(req.body.doctorId);
    appAssert(doctorId, BAD_REQUEST, "Doctor Id is required");
    const doctorDetails = await this.appUseCase.displayDoctorDetails(doctorId);
    res.status(OK).json({
      success: true,
      message: "Doctor details fetched successfully",
      doctorDetails,
    });
  });

  getSlotsHandler = catchErrors(async (req: Request, res: Response) => {
    const doctorId = stringToObjectId(req.body.doctorId);
    appAssert(doctorId, BAD_REQUEST, "Doctor Id is required");
    const slots = await this.appUseCase.getSlots(doctorId);
    res.status(OK).json({
      success: true,
      message: "Slots fetched successfully",
      slots,
    });
  });

  getAppointmentHandlers = catchErrors(async (req: Request, res: Response) => {
    const userId = stringToObjectId(req.body.patientId);
    const response = await this.appUseCase.displaySlotWithDoctorDetails(userId);
    res.status(OK).json({
      success: true,
      message: "Slot details fetched successfully",
      response,
    });
  });

  getWalletHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = stringToObjectId(req.body.userId);
    const response = await this.appUseCase.getWalletDetails(userId);
    res.status(OK).json({
      success: true,
      message: "Wallet details fetched successfully",
      response,
    });
  });

  getNotificationsHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = req as AuthenticatedRequest;
    const allNotifications = await this.appUseCase.getNotifications(userId.userId);
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
    const response = await this.appUseCase.reviewAndRating({ userId, doctorId, rating, reviewText });
    res.status(OK).json({
      success: true,
      message: "Review and rating added successfully",
      response,
    });
  });

  fetchReviewsAndRatingHandler = catchErrors(async (req: Request, res: Response) => {
    const doctorId = stringToObjectId(req.body.doctorId);
    appAssert(doctorId, BAD_REQUEST, "Doctor Id is required");
    const { reviews, rating } = await this.appUseCase.fetchReviewsAndRating(doctorId);
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
    const response = await this.appUseCase.getAllRatings();
    res.status(OK).json({
      success: true,
      message: "All reviews fetched successfully",
      response,
    });
  });
}
