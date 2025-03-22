import { Inject, Service } from "typedi";
import { PaymentUseCase } from "../../../application/user-casers/PaymentUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { Request, Response } from "express";
import { BAD_REQUEST, CREATED, OK } from "../../../shared/constants/http";
import appAssert from "../../../shared/utils/appAssert";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import logger from "../../../shared/utils/logger";

@Service()
export class PaymentController {
  constructor(@Inject() private paymentUseCase: PaymentUseCase) {}

  bookAppointment = catchErrors(async (req: Request, res: Response) => {
    console.log("From book appointment handler", req.body);
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
    const razorpay_order_id = req.body.razorpay_order_id;
    const { userId } = req as AuthenticatedRequest;
    const doctorId = stringToObjectId(req.body.doctorId);
    appAssert(razorpay_order_id, BAD_REQUEST, "Missing");
    await this.paymentUseCase.verifyPayment({ userId, razorpay_order_id, doctorId });
    res.status(OK).json({
      success: true,
      message: "Payment verified successfully",
      // newAppointmntDetails
    });
  });

  cancelAppointmentHandler = catchErrors(async (req: Request, res: Response) => {
    const appointmentId = stringToObjectId(req.body.appointmentId);
    logger.info(req.body)
    const response = await this.paymentUseCase.cancelAppointment(appointmentId);
    res.status(OK).json({
      success: true,
      message: "Appointment cancelled successfully",
      response,
    });
  });


  abortPaymentHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body);
    const orderId = req.body.orderId;
    appAssert(orderId, BAD_REQUEST, "Missing");
    const response = await this.paymentUseCase.abortPayment(orderId);
    logger.info(response);
    res.status(OK).json({
      success: true,
      message: "Payment failure recorded",
    });
  });

  // premiumSubscriptionHandler = catchErrors(async (req: Request, res: Response) => {
  //   const { type } = req.body;
  //   const { userId } = req as AuthenticatedRequest;
  //   const response = await this.paymentUseCase.buyPremiumSubscription({ type, userId });
  //   res.status(CREATED).json({
  //     success: true,
  //     message: "",
  //     response,
  //   });
  // });



  // TODO move the wallet logic to sepereate wallet controller
  walletPaymentHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    console.log(req.body)
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
    //TODO dynamic message based on the usecase
    res.status(OK).json({
      success: true,
      message: message,
      response,
    });
  });
  
  
}
