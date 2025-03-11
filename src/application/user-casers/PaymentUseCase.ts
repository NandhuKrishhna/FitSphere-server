import { Inject, Service } from "typedi";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, CONFLICT } from "../../shared/constants/http";
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
import { NotificationType } from "../../shared/constants/verficationCodeTypes";
import logger from "../../shared/utils/logger";
import { WalletParams } from "./AppUseCase";
import mongoose from "mongoose";
import { ObjectId } from "../../infrastructure/models/UserModel";

@Service()
export class PaymentUseCase {
  constructor(
    @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
    @Inject(IDoctorRepositoryToken)
    private doctorRespository: IDoctorRepository,
    @Inject(ISlotRepositoryToken) private slotRespository: ISlotRepository,
    @Inject(IAppointmentRepositoryToken)
    private appointmentRepository: IAppointmentRepository,
    @Inject(IWalletRepositoryToken) private walletRepository: IWalletRepository,
    @Inject(INotificationRepositoryToken) private notificationRepository: INotificationRepository,
    @Inject(IPremiumSubscriptionRepositoryToken) private premiumSubscriptionRepository: IPremiumSubscriptionRepository,
    @Inject(ITransactionRepositoryToken) private transactionRepository: ITransactionRepository
  ) {}

  async userAppointment({ doctorId, patientId, slotId, amount }: BookAppointmentParams) {
    const patient = await this.userRepository.findUserById(patientId);
    appAssert(patient, BAD_REQUEST, "Patient not found. Please try again.");
    const doctor = await this.doctorRespository.findDoctorByID(doctorId);
    appAssert(doctor, BAD_REQUEST, "Doctor not found. Please try again.");
    const existingSlot = await this.slotRespository.findSlotById(slotId);
    appAssert(existingSlot, BAD_REQUEST, "No slots found. Please try another slot.");
    appAssert(!existingSlot.patientId, BAD_REQUEST, "Slot is already booked. Please try another slot.");
    appAssert(existingSlot.status === "available", BAD_REQUEST, "Slot is not available. Please try another slot.");
    const overlappingAppointment = await this.appointmentRepository.findOverlappingAppointment(
      doctorId,
      existingSlot.startTime,
      existingSlot.endTime,
      existingSlot.date
    );
    appAssert(!overlappingAppointment, BAD_REQUEST, "Slot is already booked. Please try another slot.");

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: CURRENCY,
      receipt: slotId.toString(),
      payment_capture: true,
    });
    console.log("Razorpay:", razorpayOrder);
    const newAppointmentDetails = await this.appointmentRepository.createAppointment({
      doctorId,
      patientId,
      slotId,
      consultationType: existingSlot.consultationType,
      date: existingSlot.date,
      paymentStatus: "pending",
      amount,
      orderId: razorpayOrder.id,
      status: "scheduled",
    });
    return {
      newAppointmentDetails,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    };
  }

  async verifyPayment(razorpay_order_id: string) {
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    const receiptId = new mongoose.Types.ObjectId(orderInfo.receipt);
    console.log(orderInfo);
    appAssert(orderInfo, BAD_REQUEST, "Unable to fetch order details. Please try few minutes later.");

    //* if the payment is success
    if (orderInfo.status === "paid") {
      const payments = await razorpayInstance.orders.fetchPayments(razorpay_order_id);
      console.log("Payment Details : ", payments);
      const additionalDetails = {
        orderId: payments.items[0]?.order_id,
        paymentMethod: payments.items[0]?.method,
        paymentThrough: "Razorpay",
        description: payments.items[0]?.description || "",
        bank: payments.items[0]?.bank,
      };
      console.log(additionalDetails);
      const appointment = await this.appointmentRepository.updatePaymentStatus(
        receiptId,
        additionalDetails,
        "completed"
      );
      //TODO same for doctor//
      await this.notificationRepository.createNotification({
        userId: appointment?.doctorId,
        type: NotificationType.Appointment,
        message: "Your appointment has been scheduled",
        status: "pending",
        metadata: {
          meetingId: appointment?.meetingId,
          appointMentId: appointment?._id,
        },
      });
      await this.notificationRepository.createNotification({
        userId: appointment?.patientId,
        type: NotificationType.Appointment,
        message: "Your appointment has been scheduled",
        status: "pending",
        metadata: {
          meetingId: appointment?.meetingId,
          appointMentId: appointment?._id,
        },
      });
      appAssert(appointment, BAD_REQUEST, "Unable to fetch order details. Please try few minutes later.");
      await this.slotRespository.updateSlotById(appointment?.slotId, appointment?.patientId);
    }
  }
  async cancelAppointment(appointmentId: mongoose.Types.ObjectId) {
    const details = await this.appointmentRepository.cancelAppointment(appointmentId);
    appAssert(details, BAD_REQUEST, "Unable to cancel appointment. Please try few minutes later.");
    await this.slotRespository.cancelSlotById(details.slotId);
    await this.walletRepository.increaseBalance(details.patientId, details.amount);
    const wallet = await this.walletRepository.addTransaction(details.patientId, {
      type: "credit",
      amount: details.amount,
      currency: "INR",
      status: "success",
      description: "Appointment cancellation refund",
      createdAt: new Date(),
    });
    console.log(wallet, "from cancel appointment");
    return details;
  }
  async abortPayment(orderId: string) {
    try {
      // Fetch the order information
      const orderInfo = await razorpayInstance.orders.fetch(orderId);
      const receiptId = new mongoose.Types.ObjectId(orderInfo.receipt);
      logger.info("Order info fetched:", orderInfo);

      let additionalDetails = {
        orderId: orderId,
        paymentMethod: "none",
        paymentThrough: "Razorpay",
        description: "Payment cancelled or failed",
        bank: "",
      };

      try {
        // Try to fetch payments but don't fail if there are none
        const payments = await razorpayInstance.orders.fetchPayments(orderId);
        logger.info("Payment Details:", payments);

        // Only update additional details if we have payment information
        if (payments && payments.items && payments.items.length > 0) {
          additionalDetails = {
            orderId: payments.items[0]?.order_id || orderId,
            paymentMethod: payments.items[0]?.method || "none",
            paymentThrough: "Razorpay",
            description: payments.items[0]?.description || "Payment cancelled or failed",
            bank: payments.items[0]?.bank || "",
          };
        }
      } catch (paymentError) {
        // If fetching payments fails, just log it and continue with default details
        logger.warn("Failed to fetch payment details:", paymentError);
        // Continue with the default additionalDetails set above
      }

      logger.info("Using additional details:", additionalDetails);

      // Update the appointment status regardless of whether we have payment details
      const appointment = await this.appointmentRepository.updatePaymentStatus(receiptId, additionalDetails, "failed");

      // Send notification if appointment was found
      if (appointment) {
        await this.notificationRepository.createNotification({
          userId: appointment.patientId,
          type: NotificationType.Appointment,
          message: "Your payment was cancelled or failed",
          status: "pending",
          metadata: {
            meetingId: appointment.meetingId,
            appointMentId: appointment._id,
          },
        });
      }

      return { success: true, message: "Payment failure recorded successfully" };
    } catch (error) {
      logger.error(`Failed to abort payment for order ${orderId}:`, error);
      // Return a "success" response even though there was an error
      // This prevents the 400 status from being sent to the frontend
      return {
        success: true,
        message: "Payment was cancelled",
        note: "Error details logged on server",
      };
    }
  }
  /**
   // TODO razorpay and wallet payment integration 
   */
  async buyPremiumSubscription({ type, userId }: { type: string; userId: ObjectId }) {
    const user = await this.userRepository.findUserById(userId);
    appAssert(user, BAD_REQUEST, "User not found. Please try Again");
    appAssert(!user.isPremium, CONFLICT, "You are already have a subcription");
    const subscriptionPrices: Record<string, number> = {
      basic: 199,
      premium: 499,
      pro: 999,
    };
    const price = subscriptionPrices[type];
    const razorpay = await razorpayInstance.orders.create({
      amount: price * 100,
      currency: CURRENCY,
      receipt: user._id.toString(),
      payment_capture: true,
    });
  }
  //*  Wallet
  async walletPayment({ usecase, type, userId, doctorId, patientId, amount, slotId }: WalletParams) {
    if (usecase === "slot_booking") {
      const patient = await this.userRepository.findUserById(patientId!);
      appAssert(patient, BAD_REQUEST, "Patient not found. Please try again.");
      const wallet = await this.walletRepository.findWalletById(userId);
      //TODO instead of relying on amount from frontend check the fee of the doctor;
      appAssert(wallet, BAD_REQUEST, "Wallet not found. Please try again");
      appAssert(wallet.balance >= amount, BAD_REQUEST, "Insufficient balance. Please add money to wallet.");
      const doctor = await this.doctorRespository.findDoctorByID(doctorId!);
      appAssert(doctor, BAD_REQUEST, "Doctor not found. Please try again.");
      const existingSlot = await this.slotRespository.findSlotById(slotId!);
      appAssert(existingSlot, BAD_REQUEST, "No slots found. Please try another slot.");
      appAssert(!existingSlot.patientId, BAD_REQUEST, "Slot is already booked. Please try another slot.");
      appAssert(existingSlot.status === "available", BAD_REQUEST, "Slot is not available. Please try another slot.");
      const overlappingAppointment = await this.appointmentRepository.findOverlappingAppointment(
        doctorId!,
        existingSlot.startTime,
        existingSlot.endTime,
        existingSlot.date
      );
      appAssert(!overlappingAppointment, BAD_REQUEST, "Slot is already booked. Please try another slot.");
      const newAppointmentDetails = await this.appointmentRepository.createAppointment({
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
      });
      // create a transaction
      // TODO create transcation for the doctor and increase the money in doctor wallet, create notification for doctor
      const transactionInfo = await this.transactionRepository.createTransaction({
        userId: userId,
        amount: amount,
        type: "debit",
        method: "wallet",
        paymentType: "slot_booking",
        status: "success",
      });
      await this.transactionRepository.createTransaction({
        userId: doctorId!,
        amount: amount,
        type: "credit",
        method: "wallet",
        paymentType: "slot_booking",
        status: "success",
      });
      //TODO impliment this logic after implimenting doctor wallet
      //  increase the balance of doctor wallet
      // await this.walletRepository.increaseBalance(doctorId!, amount);
      await this.slotRespository.updateSlotById(slotId!, patientId!);
      await this.walletRepository.decreaseBalance(userId, amount);

      //TODO create notification for user and doctor
      //TODO create  a service to send notification like pass the [type, metada, userId and doctorId]

      return {
        newAppointmentDetails,
        transactionInfo,
      };
    } else {
      // if its subcription ......
      logger.info("Subscription payment");
      const subscriptionPrices: Record<string, number> = {
        basic: 199,
        premium: 499,
        pro: 999,
      };
      const price = subscriptionPrices[type!];
      const user = await this.userRepository.findUserById(userId);
      appAssert(user, BAD_REQUEST, "User not found. Please try again.");
      const wallet = await this.walletRepository.findWalletById(userId);
      appAssert(wallet, BAD_REQUEST, "Wallet not found. Please try again");
      appAssert(wallet.balance >= price, BAD_REQUEST, "Insufficient balance. Please add money to wallet.");
      const subscription = await this.premiumSubscriptionRepository.getSubscriptionByUserId(userId);
      appAssert(!subscription, CONFLICT, "You already have a subscription. Please try again.");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      const planName = `${type!.charAt(0).toUpperCase() + type!.slice(1)} Plan`;
      const currency = CURRENCY;
      const newSubscription = await this.premiumSubscriptionRepository.createSubscription({
        userId,
        type,
        planName,
        price,
        currency,
        startDate,
        endDate,
        status: "active",
      });
      await this.walletRepository.decreaseBalance(userId, price);
      await this.transactionRepository.createTransaction({
        userId,
        amount: price,
        type: "debit",
        method: "wallet",
        paymentType: "subscription",
        status: "success",
      });
      await this.userRepository.updateUserById(userId, { isPremium: true });
    }
    //TODO create notification for user
  }
}
