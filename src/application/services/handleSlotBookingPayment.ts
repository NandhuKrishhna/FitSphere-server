import { Inject } from "typedi";
import { BAD_REQUEST } from "../../shared/constants/http";
import appAssert from "../../shared/utils/appAssert";
import { IAppointmentRepository, IAppointmentRepositoryToken } from "../repositories/IAppointmentRepository";
import { ITransactionRepository, ITransactionRepositoryToken } from "../repositories/ITransactionRepository";
import { IWalletRepository, IWalletRepositoryToken } from "../repositories/IWalletRepository";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { SendAppointmentNotifications } from "./sendAppointmentNotifications";

export class SlotPayment {
    constructor(
        @Inject(IAppointmentRepositoryToken) private appointmentRepository: IAppointmentRepository,
        @Inject(ITransactionRepositoryToken) private transactionRepository: ITransactionRepository,
        @Inject(ISlotRepositoryToken) private slotRespository: ISlotRepository,
        @Inject(IWalletRepositoryToken) private walletRepository: IWalletRepository,
        @Inject(() => SendAppointmentNotifications) private sendAppointmentNotifications: SendAppointmentNotifications
    ) { }
    async handleSlotBookingPayment(userId: ObjectId, doctorId: ObjectId, doctorName: string, receiptId: string, paymentDetails: any) {
        const appointment = await this.appointmentRepository.updatePaymentStatus(receiptId, paymentDetails, "completed");
        appAssert(appointment, BAD_REQUEST, "Appointment details are missing. Please try again.");

        const doctorTransaction = await this.transactionRepository.createTransaction({
            from: userId,
            fromModel: "User",
            to: doctorId,
            toModel: "Doctor",
            amount: Number(paymentDetails.orderId) / 100,
            type: "credit",
            method: "razorpay",
            paymentType: "slot_booking",
            status: "success",
            bookingId: appointment._id as string,
            paymentGatewayId: paymentDetails.orderId,
            relatedTransactionId: receiptId,
        });

        await this.slotRespository.updateSlotById(appointment?.slotId, appointment?.patientId);

        await this.walletRepository.increaseBalance({
            userId: doctorId,
            role: "Doctor",
            amount: Number(paymentDetails.orderId) / 100,
            description: "Slot Booking",
            relatedTransactionId: doctorTransaction._id as string,
        });

        await this.sendAppointmentNotifications.sendAppointmentNotifications(appointment, doctorName);

        return { appointment, message: "Payment verified and appointment confirmed" };
    }

}