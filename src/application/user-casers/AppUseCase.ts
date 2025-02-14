import mongoose, { mongo } from "mongoose";
import cloudinary from "../../infrastructure/config/cloudinary";
import { DisplayDoctorsParams } from "../../domain/types/doctorTypes";
import { Inject, Service } from "typedi";
import {
  IUserRepository,
  IUserRepositoryToken,
} from "../repositories/IUserRepository";
import {
  IDoctorRepository,
  IDoctorRepositoryToken,
} from "../repositories/IDoctorReposirtory";
import {
  ISlotRepository,
  ISlotRepositoryToken,
} from "../repositories/ISlotRepository";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../../shared/constants/http";
import { CURRENCY } from "../../shared/constants/env";
import { razorpayInstance } from "../../infrastructure/config/razorypay";
import { BookAppointmentParams } from "../../domain/types/appTypes";
import {
  IAppointmentRepository,
  IAppointmentRepositoryToken,
} from "../repositories/IAppointmentRepository";
import { Appointments } from "../../domain/entities/Appointments";

import { sendMail } from "../../shared/constants/sendMail";
import { getAppointmentBookedTemplate } from "../../shared/utils/EmailTemplates/AppointmentSuccessfullTemplate";
import { RazorpayParams } from "../../domain/types/razorypay";
import { IWalletRepository, IWalletRepositoryToken } from "../repositories/IWalletRepository";

@Service()
export class AppUseCase {
  constructor(
    @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
    @Inject(IDoctorRepositoryToken)
    private doctorRespository: IDoctorRepository,
    @Inject(ISlotRepositoryToken) private slotRespository: ISlotRepository,
    @Inject(IAppointmentRepositoryToken)
    private appointmentRepository: IAppointmentRepository,
    @Inject(IWalletRepositoryToken) private walletRepository: IWalletRepository
  ) {}
  async displayAllDoctors({ page, limit, search, sort }: DisplayDoctorsParams) {
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
    });
    return doctors;
  }

  async updateProfile(userId: mongoose.Types.ObjectId, profilePic: string) {
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await this.userRepository.updateProfile(
      userId,
      uploadResponse.secure_url
    );
    return updatedUser;
  }

  async displayDoctorDetails(doctorId: mongoose.Types.ObjectId) {
    const details = await this.doctorRespository.fetchDoctorandDetailsById(
      doctorId
    );
    appAssert(details, BAD_REQUEST, "Doctor details not found");
    return details;
  }

  async getSlots(doctorId: mongoose.Types.ObjectId) {
    const slots = await this.slotRespository.findAllSlots(doctorId);
    appAssert(slots, NOT_FOUND, "No slots found. Please try another slot.");
    return slots;
  }

  async userAppointment({
    doctorId,
    patientId,
    slotId,
    amount,
  }: BookAppointmentParams) {
    const patient = await this.userRepository.findUserById(patientId);
    appAssert(patient, BAD_REQUEST, "Patient not found. Please try again.");
    const doctor = await this.doctorRespository.findDoctorByID(doctorId);
    appAssert(doctor, BAD_REQUEST, "Doctor not found. Please try again.");
    const existingSlot = await this.slotRespository.findSlotById(slotId);
    appAssert(
      existingSlot,
      BAD_REQUEST,
      "No slots found. Please try another slot."
    );
    appAssert(
      !existingSlot.patientId,
      BAD_REQUEST,
      "Slot is already booked. Please try another slot."
    );
    appAssert(
      existingSlot.status === "available",
      BAD_REQUEST,
      "Slot is not available. Please try another slot."
    );
    const overlappingAppointment =
      await this.appointmentRepository.findOverlappingAppointment(
        doctorId,
        existingSlot.startTime,
        existingSlot.endTime,
        existingSlot.date
      );
    appAssert(
      !overlappingAppointment,
      BAD_REQUEST,
      "Slot is already booked. Please try another slot."
    );

    // creating rAzorypay;
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: CURRENCY,
      receipt: slotId.toString() ,
      payment_capture: true,
    });

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
      "scheduled",
    );

    const newAppointmentDetails =
      await this.appointmentRepository.createAppointment(newAppointment);

    return {
      newAppointmentDetails,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    };
  }


  async verifyPayment(razorpay_order_id: string){
      const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
      // console.log(orderInfo);
      // console.log(typeof orderInfo.receipt)
      appAssert(orderInfo , BAD_REQUEST , "Unable to fetch order details. Please try few minutes later.")
      if(orderInfo.status === "paid"){
        const receiptId = new mongoose.Types.ObjectId(orderInfo.receipt)
        console.log(typeof receiptId)
        console.log(receiptId)
       const appointment = await this.appointmentRepository.updatePaymentStatus(receiptId);
       appAssert(appointment , BAD_REQUEST , "Unable to fetch order details. Please try few minutes later.")
        await this.slotRespository.updateSlotById(appointment?.slotId,appointment?.patientId)
      }
  }

  async displaySlotWithDoctorDetails(userId : mongoose.Types.ObjectId){
     const details =  await this.appointmentRepository.findDetailsByPatientId(userId)
     appAssert(details , BAD_REQUEST , "Unable to fetch order details. Please try few minutes later.")
     return details
  };


  async cancelAppointment(appointmentId : mongoose.Types.ObjectId){
    const details =  await this.appointmentRepository.cancelAppointment(appointmentId)
    appAssert(details , BAD_REQUEST , "Unable to cancel appointment. Please try few minutes later.");
    await this.walletRepository.increaseBalance(details.patientId , details.amount)
    const wallet = await this.walletRepository.addTransaction(details.patientId, {
      type: "credit",
      amount: details.amount,
      currency: "INR",
      status: "success",
      description: "Appointment cancellation refund",
      createdAt: new Date(),
    });
    console.log(wallet , "from cancel appointment")
    return details
  };

  async getWalletDetails(userId : mongoose.Types.ObjectId){
    const details =  await this.walletRepository.getWalletDetailsById(userId , {})
    return details
  }
}
