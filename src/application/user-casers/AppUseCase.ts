import mongoose from "mongoose";
import cloudinary from "../../infrastructure/config/cloudinary";
import { DisplayDoctorsParams } from "../../domain/types/doctorTypes";
import { Inject, Service } from "typedi";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../../shared/constants/http";
import { CURRENCY } from "../../shared/constants/env";
import { razorpayInstance } from "../../infrastructure/config/razorypay";
import { BookAppointmentParams } from "../../domain/types/appTypes";
import { IAppointmentRepository, IAppointmentRepositoryToken } from "../repositories/IAppointmentRepository";
import { Appointments } from "../../domain/entities/Appointments";
import { IWalletRepository, IWalletRepositoryToken } from "../repositories/IWalletRepository";
import { INotificationRepository, INotificationRepositoryToken } from "../repositories/INotificationRepository";
import { NotificationType } from "../../shared/constants/verficationCodeTypes";
import logger from "../../shared/utils/logger";

@Service()
export class AppUseCase {
  constructor(
    @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
    @Inject(IDoctorRepositoryToken)
    private doctorRespository: IDoctorRepository,
    @Inject(ISlotRepositoryToken) private slotRespository: ISlotRepository,
    @Inject(IAppointmentRepositoryToken)
    private appointmentRepository: IAppointmentRepository,
    @Inject(IWalletRepositoryToken) private walletRepository: IWalletRepository,
    @Inject(INotificationRepositoryToken) private notificationRepository: INotificationRepository
  ) {}
  async displayAllDoctors({
    page,
    limit,
    search,
    sort,
    gender,
    specialty,
    language,
    experience,
  }: DisplayDoctorsParams) {
    let sortBy: Record<string, string> = {};

    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "asc";
    }

    const doctors = await this.doctorRespository.fetchAllDoctors({
      page,
      limit,
      search,
      sortBy,
      gender,
      specialty,
      language,
      experience,
    });
    return doctors;
  }

  async updateProfile(userId: mongoose.Types.ObjectId, profilePic: string) {
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await this.userRepository.updateProfile(userId, uploadResponse.secure_url);
    appAssert(updatedUser, BAD_REQUEST, "Failed to update profile");
    return updatedUser;
  }

  async displayDoctorDetails(doctorId: mongoose.Types.ObjectId) {
    const details = await this.doctorRespository.fetchDoctorandDetailsById(doctorId);
    appAssert(details, BAD_REQUEST, "Doctor details not found");
    return details;
  }

  async getSlots(doctorId: mongoose.Types.ObjectId) {
    const slots = await this.slotRespository.findAllActiveSlots(doctorId);
    appAssert(slots, NOT_FOUND, "No slots found. Please try another slot.");
    return slots;
  }

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
    const newAppointment = new Appointments(
      new mongoose.Types.ObjectId(),
      doctorId,
      patientId,
      slotId,
      existingSlot.consultationType,
      existingSlot.date,
      "pending",
      amount,
      razorpayOrder.id,
      "scheduled"
    );

    const newAppointmentDetails = await this.appointmentRepository.createAppointment(newAppointment);
    // const patientNotification = INotification(
    //   patientId,
    //   NotificationType.Appointment,
    //   "Your appointment has been scheduled",
    //   "pending",
    //   {
    //     meetingId: newAppointmentDetails.meetingId,
    //     appointMentId: newAppointmentDetails._id,
    //   }
    // );
    // const patientSocketId = getReceiverSocketId(patientId);
    // if (patientSocketId) {
    //   io.to(patientSocketId).emit("newNotification", patientNotification);
    // }
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
      // creating notification for user
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

  async displaySlotWithDoctorDetails(userId: mongoose.Types.ObjectId) {
    const details = await this.appointmentRepository.findDetailsByPatientId(userId);
    appAssert(details, BAD_REQUEST, "Unable to fetch order details. Please try few minutes later.");
    return details;
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

  async getWalletDetails(userId: mongoose.Types.ObjectId) {
    const details = await this.walletRepository.getWalletDetailsById(userId, {});
    return details;
  }
  async getNotifications(userId: mongoose.Types.ObjectId) {
    const details = await this.notificationRepository.getAllNotificationById(userId);
    appAssert(details, BAD_REQUEST, "Unable to fetch notifications. Please try few minutes later.");
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
}
