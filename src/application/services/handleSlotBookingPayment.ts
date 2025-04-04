import { Inject, Service } from "typedi";
import { BAD_REQUEST, NOT_FOUND } from "../../shared/constants/http";
import appAssert from "../../shared/utils/appAssert";
import { IAppointmentRepository, IAppointmentRepositoryToken } from "../repositories/IAppointmentRepository";
import { ITransactionRepository, ITransactionRepositoryToken } from "../repositories/ITransactionRepository";
import { IWalletRepository, IWalletRepositoryToken } from "../repositories/IWalletRepository";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { SendAppointmentNotifications } from "./sendAppointmentNotifications";
export type AdditonDetails = {
    orderId: string;
    paymentMethod: string;
    paymentThrough: string;
    description: string;
    bank: string;
    meetingId: string;
};
@Service()
export class SlotPaymentService {
    constructor(
        @Inject(IAppointmentRepositoryToken) private _appointmentRepository: IAppointmentRepository,
        @Inject(ITransactionRepositoryToken) private __transactionRepository: ITransactionRepository,
        @Inject(ISlotRepositoryToken) private __slotRespository: ISlotRepository,
        @Inject(IWalletRepositoryToken) private __walletRepository: IWalletRepository,
        @Inject(() => SendAppointmentNotifications) private sendAppointmentNotifications: SendAppointmentNotifications
    ) { }
    async handleSlotBookingPayment(
        userId: ObjectId,
        doctorId: ObjectId,
        doctorName: string,
        receiptId: string,
        paymentDetails: AdditonDetails,
        razorpay_order_id: string,
        orderinfo_amount: string | number

    ) {

        const appointment = await this._appointmentRepository.updatePaymentStatus(receiptId, paymentDetails, "completed");
        appAssert(appointment, BAD_REQUEST, "Appointment details are missing. Please try again.");

        const updatedUserTransaction = await this.__transactionRepository.updateTransaction(
            { paymentGatewayId: receiptId },
            {
                status: "success",
                paymentGatewayId: paymentDetails.orderId || razorpay_order_id,
            }
        );
        appAssert(updatedUserTransaction, BAD_REQUEST, "Failed to update user transaction.");

        const doctorTransaction = await this.__transactionRepository.createTransaction({
            from: userId,
            fromModel: "User",
            to: appointment.doctorId || doctorId,
            toModel: "Doctor",
            amount: Number(orderinfo_amount) / 100,
            type: "credit",
            method: "razorpay",
            paymentType: "slot_booking",
            status: "success",
            bookingId: appointment._id as string,
            paymentGatewayId: paymentDetails.orderId || razorpay_order_id,
            relatedTransactionId: updatedUserTransaction.transactionId,
        });

        const updatedSlot = await this.__slotRespository.updateSlotById(appointment?.slotId, appointment?.patientId);
        appAssert(updatedSlot, NOT_FOUND, "Slot details not found")
        await this.__walletRepository.increaseBalance({
            userId: doctorId || appointment.doctorId,
            role: "Doctor",
            amount: Number(orderinfo_amount) / 100,
            description: "Slot Booking",
            relatedTransactionId: doctorTransaction._id as string,
        });

        await this.sendAppointmentNotifications.sendAppointmentNotifications(appointment, doctorName, updatedSlot);

        return { appointment, message: "Payment verified and appointment confirmed" };
    }

}