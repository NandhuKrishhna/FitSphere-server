import { Inject, Service } from "typedi";
import { PaymentUseCase } from "../../../application/user-casers/PaymentUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { Request, Response } from "express";
import { BAD_REQUEST, CREATED, OK } from "../../../shared/constants/http";
import appAssert from "../../../shared/utils/appAssert";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import logger from "../../../shared/utils/logger";
import mongoose, { isValidObjectId } from "mongoose";

@Service()
export class PaymentController {
  constructor(@Inject() private paymentUseCase: PaymentUseCase) { }

  bookAppointment = catchErrors(async (req: Request, res: Response) => {
    const { slotId, amount, doctorId, patientId } = req.body;
    const { newAppointmentDetails, order } = await this.paymentUseCase.userAppointment({
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
    logger.info("Req body from the verify payment handler:", req.body);

    const { razorpay_order_id, doctorName, paymentType, doctorId } = req.body;
    const subscriptionId = req.body.subscriptionId
      ? new mongoose.Types.ObjectId(req.body.subscriptionId)
      : undefined;


    appAssert(paymentType, BAD_REQUEST, "Payment Type is Missing.");
    appAssert(razorpay_order_id, BAD_REQUEST, "Missing Razorpay Order ID.");

    const { userId } = req as AuthenticatedRequest;

    await this.paymentUseCase.verifyPayment({
      doctorId,
      userId,
      razorpay_order_id,
      doctorName,
      paymentType,
      subscriptionId
    });

    res.status(OK).json({
      success: true,
      message: "Payment verified successfully",
    });
  });


  cancelAppointmentHandler = catchErrors(async (req: Request, res: Response) => {
    const appointmentId = stringToObjectId(req.body.appointmentId);
    const response = await this.paymentUseCase.cancelAppointment(appointmentId);
    res.status(OK).json({
      success: true,
      message: "Appointment cancelled successfully",
      response,
    });
  });


  abortPaymentHandler = catchErrors(async (req: Request, res: Response) => {
    const orderId = req.body.orderId;
    appAssert(orderId, BAD_REQUEST, "Missing");
    const response = await this.paymentUseCase.abortPayment(orderId);
    logger.info(response);
    res.status(OK).json({
      success: true,
      message: "Payment failure recorded",
    });
  });

  premiumSubscriptionHandler = catchErrors(async (req: Request, res: Response) => {
    const subscriptionId = stringToObjectId(req.body.subscriptionId);
    const { userId } = req as AuthenticatedRequest;
    const response = await this.paymentUseCase.buyPremiumSubscription({ subscriptionId, userId });
    res.status(CREATED).json({
      success: true,
      response,
    });
  });


  walletPaymentHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { usecase, type, doctorId, slotId, amount, patientId } = req.body;
    const response = await this.paymentUseCase.walletPayment({
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
    res.status(OK).json({
      success: true,
      message: message,
      response,
    });
  });


}
