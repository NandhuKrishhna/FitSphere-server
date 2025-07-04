import { Inject, Service } from "typedi";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../../shared/constants/http";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";
import { BookAppointmentParams } from "../../domain/types/appTypes";
import { razorpayInstance } from "../../infrastructure/config/razorypay";
import { CURRENCY } from "../../shared/constants/env";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import { IWalletRepository, IWalletRepositoryToken } from "../repositories/IWalletRepository";
import {
  IPremiumSubscriptionRepository,
  IPremiumSubscriptionRepositoryToken,
} from "../repositories/IPremiumSubscription";
import { IAppointmentRepository, IAppointmentRepositoryToken } from "../repositories/IAppointmentRepository";
import { INotificationRepository, INotificationRepositoryToken } from "../repositories/INotificationRepository";
import { ITransactionRepository, ITransactionRepositoryToken } from "../repositories/ITransactionRepository";
import { NotificationType } from "../../shared/constants/verificationCodeTypes";
import mongoose, { isValidObjectId } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Role from "../../shared/constants/UserRole";
import { getReceiverSocketId, io } from "../../infrastructure/config/socket.io";
import { formatDate, formatToIndianTime } from "../../shared/utils/timeConvertor";
import { emitNotification } from "../../shared/utils/emitNotification";
import { VerifyPaymentParams } from "../../domain/types/paymentParams.types";
import { IRazorpayPaymentsResponse } from "../../domain/types/razorypay";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { IUserSubscriptionRepository, IUserSubscriptionRepositoryToken } from "../repositories/IUserSubscriptionRepository";
import { SlotPaymentService } from "../services/handleSlotBookingPayment";
import { SubscriptionPayment } from "../services/handleSubscriptionPayment";
import { WalletParams } from "./interface-types/UseCase-types";
import { IPaymentUseCase } from "./interface/IPaymentUseCase";
import { AppointmentDocument } from "../../infrastructure/models/appointmentModel";

export type BuyPremiumSubscriptionParams = {
  subscriptionId: ObjectId,
  userId: ObjectId
}

@Service()
export class PaymentUseCase implements IPaymentUseCase {
  constructor(
    @Inject(IUserRepositoryToken) private _userRepository: IUserRepository,
    @Inject(IDoctorRepositoryToken)
    private doctorRespository: IDoctorRepository,
    @Inject(ISlotRepositoryToken) private __slotRespository: ISlotRepository,
    @Inject(IAppointmentRepositoryToken)
    private _appointmentRepository: IAppointmentRepository,
    @Inject(IWalletRepositoryToken) private __walletRepository: IWalletRepository,
    @Inject(INotificationRepositoryToken) private __notificationRepository: INotificationRepository,
    @Inject(IPremiumSubscriptionRepositoryToken) private _premiumSubscriptionRepository: IPremiumSubscriptionRepository,
    @Inject(ITransactionRepositoryToken) private __transactionRepository: ITransactionRepository,
    @Inject(IUserSubscriptionRepositoryToken) private userSubscriptionRepository: IUserSubscriptionRepository,
    @Inject(() => SlotPaymentService) private __slotPaymentService: SlotPaymentService,
    @Inject(() => SubscriptionPayment) private __subscriptionService: SubscriptionPayment
  ) { }

  async userAppointment({ doctorId, patientId, slotId, amount }: BookAppointmentParams) {
    const patient = await this._userRepository.findUserById(patientId);
    appAssert(patient, BAD_REQUEST, "Patient not found. Please try again.");
    const doctor = await this.doctorRespository.findDoctorByID(doctorId);
    appAssert(doctor, BAD_REQUEST, "Doctor not found. Please try again.");
    appAssert(doctor.status !== "blocked", BAD_REQUEST, "Doctor is not active. Please book another doctor");
    const existingSlot = await this.__slotRespository.findSlotById(slotId);
    appAssert(existingSlot, BAD_REQUEST, "No slots found. Please try another slot.");
    appAssert(!existingSlot.patientId, BAD_REQUEST, "Slot is already booked. Please try another slot.");
    appAssert(existingSlot.status === "available", BAD_REQUEST, "Slot is not available. Please try another slot.");
    const currentTime = new Date();
    const slotStartTime = new Date(existingSlot.startTime);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istCurrentTime = new Date(currentTime.getTime() + istOffset);
    appAssert(slotStartTime > istCurrentTime, BAD_REQUEST, "Slot is not available. Please try another slot.");
    const shortPatientId = patientId.toString().slice(-6);
    const receiptId = `rct_${shortPatientId}_${Date.now().toString()}`;
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: CURRENCY,
      receipt: receiptId,
      payment_capture: true,
    });

    const newAppointmentDetails = await this._appointmentRepository.createAppointment({
      doctorId,
      patientId,
      slotId,
      consultationType: existingSlot.consultationType,
      date: existingSlot.date,
      amount,
      orderId: razorpayOrder.receipt,
    });

    const transaction = await this.__transactionRepository.createTransaction({
      from: patientId,
      fromModel: "User",
      to: doctorId,
      toModel: "Doctor",
      amount: amount,
      type: "debit",
      method: "razorpay",
      paymentType: "slot_booking",
      status: "pending",
      paymentGatewayId: razorpayOrder.receipt,
      bookingId: newAppointmentDetails?._id as string,
    });



    return {
      newAppointmentDetails,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      transactionId: transaction.transactionId,
    };
  }

  async verifyPayment({
    userId,
    razorpay_order_id,
    doctorId,
    doctorName,
    paymentType,
    subscriptionId
  }: VerifyPaymentParams) {

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    const receiptId = orderInfo.receipt
    appAssert(orderInfo, BAD_REQUEST, "Unable to fetch order details. Please try again later.");
    appAssert(receiptId, BAD_REQUEST, "Unable to fetch order details. Please try again later.");
    let response;
    //* Slot Payment
    if (orderInfo.status === "paid" && paymentType === "slot_booking") {
      const payments = await razorpayInstance.orders.fetchPayments(razorpay_order_id);
      const additionalDetails = {
        orderId: payments.items[0]?.order_id,
        paymentMethod: payments.items[0]?.method,
        paymentThrough: "Razorpay",
        description: payments.items[0]?.description || "",
        bank: payments.items[0]?.bank,
        meetingId: uuidv4(),
      };
      response = await this.__slotPaymentService.handleSlotBookingPayment(
        userId,
        doctorId!,
        doctorName!,
        receiptId!,
        additionalDetails,
        razorpay_order_id,
        orderInfo.amount
      )

    }
    if (orderInfo.status === "paid" && paymentType === "subscription") {
      appAssert(subscriptionId, NOT_FOUND, "Subscription Id not found. Please try after some time.")
      const payments = await razorpayInstance.orders.fetchPayments(razorpay_order_id);
      response = await this.__subscriptionService.handleSubscriptionPayment({
        userId,
        subscriptionId,
        razorpay_order_id,
        orderinfo_amount: orderInfo.amount,
        receiptId
      })
    }


    return response || { message: undefined };
  }




  async cancelAppointment(appointmentId: mongoose.Types.ObjectId) {
    const appointment = await this._appointmentRepository.findAppointmentById(appointmentId);
    appAssert(appointment, BAD_REQUEST, "Appointment not found. Please try again.");
    appAssert(appointment.status !== "cancelled", BAD_REQUEST, "Appointment is already cancelled.");
    appAssert(appointment.status !== "completed", BAD_REQUEST, "Appointment is already completed.");
    const details = await this._appointmentRepository.cancelAppointment(appointmentId);
    appAssert(details, BAD_REQUEST, "Unable to cancel appointment. Please try few minutes later.");
    await this.__slotRespository.cancelSlotById(details.slotId);
    // Decreasing from the Doctor and Increasing to the Patient
    await this.__walletRepository.decreaseBalance({
      userId: details.doctorId,
      role: "Doctor",
      amount: details.amount,
      description: "Appointment cancellation refund",
    })
    await this.__walletRepository.increaseBalance({
      userId: details.patientId,
      role: "User",
      amount: details.amount,
      description: "Appointment cancellation refund",
    });
    await this.__transactionRepository.createTransaction({
      from: details.doctorId,
      fromModel: "Doctor",
      to: details.patientId,
      toModel: "User",
      amount: Number(details.amount),
      type: "debit",
      method: "wallet",
      paymentType: "cancel_appointment",
      status: "success",
      bookingId: details._id as string,

    });

    await this.__transactionRepository.createTransaction({
      from: details.doctorId,
      fromModel: "Doctor",
      to: details.patientId,
      toModel: "User",
      amount: Number(details.amount),
      type: "credit",
      method: "wallet",
      paymentType: "cancel_appointment",
      status: "success",
      bookingId: details._id as string,
    });
    const doctorDetails = await this.doctorRespository.findDoctorByID(details.doctorId);
    const userDetails = await this._userRepository.findUserById(details.patientId);
    const doctorSocketId = getReceiverSocketId(details?.doctorId.toString());
    const patientSocketId = getReceiverSocketId(details?.patientId.toString());

    const doctorMessage = `Your appointment with ${userDetails?.name} at
                           ${formatDate(details?.date?.toISOString()!)} has been cancelled.`;

    const patientMessage = `Your appointment with ${doctorDetails?.name} has been cancelled.`;
    emitNotification(doctorSocketId, doctorMessage);
    emitNotification(patientSocketId, patientMessage);

    return details;
  }




  async abortPayment(orderId: string) {
    try {
      const orderInfo = await razorpayInstance.orders.fetch(orderId);
      const receiptId = orderInfo.receipt;

      let additionalDetails = {
        orderId: orderId,
        paymentMethod: "none",
        paymentThrough: "Razorpay",
        description: "Payment cancelled or failed",
        bank: "",
        meetingId: "",
      };

      let payments: IRazorpayPaymentsResponse | null = null;

      try {
        payments = await razorpayInstance.orders.fetchPayments(orderId) as IRazorpayPaymentsResponse;
        if (payments?.items?.length > 0) {
          additionalDetails = {
            orderId: payments.items[0]?.order_id || orderId,
            paymentMethod: payments.items[0]?.method || "none",
            paymentThrough: "Razorpay",
            description: payments.items[0]?.description || "Payment cancelled or failed",
            bank: payments.items[0]?.bank || "",
            meetingId: "",
          };
        }
      } catch (paymentError) {

      };
      const appointment = await this._appointmentRepository.updatePaymentStatus(receiptId!, additionalDetails, "failed");

      if (appointment) {
        await this.__notificationRepository.createNotification({
          userId: appointment.patientId,
          role: Role.USER,
          type: NotificationType.Appointment,
          message: "Your payment was cancelled or failed",
          status: "pending",
        });
        const response = await this.__transactionRepository.updateTransaction(
          { paymentGatewayId: receiptId },
          {
            status: "failed",
            type: "failed",
            paymentGatewayId: payments?.items[0]?.id || receiptId,
          }
        );

      }
      return { success: true, message: "Payment failure recorded successfully" };
    } catch (error) {
      return {
        success: false,
        message: "Payment failed",
        note: "Error details logged on server",
      };
    }
  }


  async walletPayment({ usecase, type, userId, doctorId, patientId, amount, slotId }: WalletParams) {
    if (usecase === "slot_booking") {
      const patient = await this._userRepository.findUserById(patientId!);
      appAssert(patient, BAD_REQUEST, "Patient not found. Please try again.");
      const wallet = await this.__walletRepository.findWalletById(userId, "User");
      appAssert(wallet, BAD_REQUEST, "Wallet not found. Please try again");
      appAssert(wallet.balance > amount, BAD_REQUEST, "Insufficient balance.Please choose another payment method.");
      const doctor = await this.doctorRespository.findDoctorByID(doctorId!);
      appAssert(doctor, BAD_REQUEST, "Doctor not found. Please try again.");
      const existingSlot = await this.__slotRespository.findSlotById(slotId!);
      appAssert(existingSlot, BAD_REQUEST, "No slots found. Please try another slot.");
      appAssert(!existingSlot.patientId, BAD_REQUEST, "Slot is already booked. Please try another slot.");
      appAssert(existingSlot.status === "available", BAD_REQUEST, "Slot is not available. Please try another slot.");
      const overlappingAppointment = await this._appointmentRepository.findOverlappingAppointment(
        doctorId!,
        existingSlot.startTime,
        existingSlot.endTime,
        existingSlot.date
      );
      appAssert(!overlappingAppointment, BAD_REQUEST, "Slot is already booked. Please try another slot.");
      const newAppointmentDetails = await this._appointmentRepository.createAppointment({
        doctorId,
        patientId,
        slotId,
        consultationType: existingSlot.consultationType,
        date: existingSlot.date,
        paymentStatus: "completed",
        amount,
        status: "scheduled",
        paymentMethod: "wallet",
        paymentThrough: "wallet",
        description: "Slot booking",
        meetingId: uuidv4(),
      });
      const doctorTransaction = await this.__transactionRepository.createTransaction({
        from: userId,
        fromModel: "User",
        to: doctorId,
        toModel: "Doctor",
        amount: Number(amount),
        type: "credit",
        method: "wallet",
        paymentType: "slot_booking",
        status: "success",
        bookingId: newAppointmentDetails?._id as string,
        relatedTransactionId: wallet._id as string,
      });
      //user transaction
      const userTransaction = await this.__transactionRepository.createTransaction({
        from: userId,
        fromModel: "User",
        to: doctorId,
        toModel: "Doctor",
        amount: Number(amount),
        type: "debit",
        method: "wallet",
        paymentType: "slot_booking",
        status: "success",
        bookingId: newAppointmentDetails?._id as string,
        relatedTransactionId: wallet._id as string,
      });

      const updatedSlotDetails = await this.__slotRespository.updateSlotById(slotId!, patientId!);
      await this.__walletRepository.increaseBalance({
        userId: doctorId!,
        role: "Doctor",
        amount: Number(amount),
        description: "Slot Booking",
        relatedTransactionId: doctorTransaction._id as string
      });
      await this.__walletRepository.decreaseBalance({
        userId: patientId!,
        role: "User",
        amount: Number(amount),
        description: "Slot Booking",
        relatedTransactionId: userTransaction._id as string
      });

      try {
        const [doctorNotification, patientNotification] = await Promise.all([
          this.__notificationRepository.createNotification({
            userId: doctorId,
            role: Role.DOCTOR,
            type: NotificationType.Appointment,
            message: `A new appointment with ${patient?.name}
             has been scheduled on ${formatDate(updatedSlotDetails?.date?.toISOString()!)}
             at ${formatToIndianTime(updatedSlotDetails?.startTime?.toISOString()!)}
              - ${formatToIndianTime(updatedSlotDetails?.endTime?.toISOString()!)}`,
            metadata: {
              meetingId: newAppointmentDetails?.meetingId,
              appointMentId: newAppointmentDetails?._id,
            },
          }),
          this.__notificationRepository.createNotification({
            userId: patientId,
            role: Role.USER,
            type: NotificationType.Appointment,
            message: `Your appointment with ${doctor?.name}
             has been scheduled on ${formatDate(updatedSlotDetails?.date?.toISOString()!)}
             at ${formatToIndianTime(updatedSlotDetails?.startTime?.toISOString()!)}
              - ${formatToIndianTime(updatedSlotDetails?.endTime?.toISOString()!)}`,
            metadata: {
              meetingId: newAppointmentDetails?.meetingId,
              appointMentId: newAppointmentDetails?._id,
            },
          }),
        ]);
        const doctorSocketId = getReceiverSocketId(doctorId);
        const patientSocketId = getReceiverSocketId(patientId);
        emitNotification(doctorSocketId, doctorNotification.message);
        emitNotification(patientSocketId, patientNotification.message);
      } catch (error) {
        console.error("Notification creation failed:", error);
      }


      return newAppointmentDetails;
    }

  }


  async buyPremiumSubscription({ subscriptionId, userId }: BuyPremiumSubscriptionParams) {

    appAssert(subscriptionId, BAD_REQUEST, "Subscription not found. Please try again.");
    const subscriptionDetails = await this._premiumSubscriptionRepository.getSubscriptionById(subscriptionId);
    appAssert(subscriptionDetails, BAD_REQUEST, "Subscription not found. Please try again.");
    const userSubscription = await this.userSubscriptionRepository.getSubscriptionDetails(userId);
    console.log(userSubscription)
    appAssert(userSubscription?.subscriptionId !== subscriptionId, BAD_REQUEST, `You already have an ${subscriptionDetails.planName} subscription. Please try again later.`);
    const userDetails = await this._userRepository.findUserById(userId);
    appAssert(userDetails, BAD_REQUEST, "User not found. Please try again.");


    const shortPatientId = userDetails.toString().slice(-6);
    const receiptId = `rct_${shortPatientId}_${Date.now().toString()}`;
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: subscriptionDetails.price * 100,
      currency: CURRENCY,
      receipt: receiptId,
      payment_capture: true,
    })

    const transaction = await this.__transactionRepository.createTransaction({
      from: userId,
      fromModel: "User",
      amount: subscriptionDetails.price,
      type: "debit",
      method: "razorpay",
      paymentType: "subscription",
      status: "pending",
      paymentGatewayId: razorpayOrder.receipt,
    })

    return {
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        subscriptionId: subscriptionDetails._id as ObjectId,
      },

    }

  }

}

