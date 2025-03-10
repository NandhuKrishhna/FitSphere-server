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

  bookAppointment = catchErrors(async (req: Request, res: Response) => {
    console.log("From book appointment handler", req.body);
    const { slotId, amount, doctorId, patientId } = req.body;
    const { newAppointmentDetails, order } = await this.appUseCase.userAppointment({
      slotId,
      amount,
      doctorId,
      patientId,
    });
    res.status(OK).json({
      success: true,
      message: "Appointment booked successfully",
      newAppointmentDetails,
      order,
    });
  });

  verifyPaymentHandler = catchErrors(async (req: Request, res: Response) => {
    const razorpay_order_id = req.body.razorpay_order_id;
    appAssert(razorpay_order_id, BAD_REQUEST, "Missing");
    await this.appUseCase.verifyPayment(razorpay_order_id);
    res.status(OK).json({
      success: true,
      message: "Payment verified successfully",
      // newAppointmntDetails
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

  cancelAppointmentHandler = catchErrors(async (req: Request, res: Response) => {
    const appointmentId = stringToObjectId(req.body.appointmentId);
    const response = await this.appUseCase.cancelAppointment(appointmentId);
    res.status(OK).json({
      success: true,
      message: "Appointment cancelled successfully",
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

  //TODO abortPayment handler;
  abortPaymentHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body);
    const orderId = req.body.orderId;
    appAssert(orderId, BAD_REQUEST, "Missing");
    const response = await this.appUseCase.abortPayment(orderId);
    logger.info(response);
    res.status(OK).json({
      success: true,
      message: "Payment failure recorded",
    });
  });

  // * PremiumSubscription:
  premiumSubscriptionHandler = catchErrors(async (req: Request, res: Response) => {
    const { type } = req.body;
    const { userId } = req as AuthenticatedRequest;
    const response = await this.appUseCase.buyPremiumSubscription({ type, userId });
    res.status(CREATED).json({
      success: true,
      message: "",
      response,
    });
  });
  // TODO move the wallet logic to sepereate wallet controller
  walletPaymentHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { usecase, type, doctorId, slotId, amount, patientId } = req.body;
    const response = await this.appUseCase.walletPayment({
      userId,
      usecase,
      type,
      doctorId,
      slotId,
      amount,
      patientId,
    });
    let message;
    usecase === "slot_booking"
      ? (message = "Slot booked successfully")
      : (message = "Subscription purchased successfully");
    //TODO dynamic message based on the usecase
    res.status(OK).json({
      success: true,
      message: message,
      response,
    });
  });
}
