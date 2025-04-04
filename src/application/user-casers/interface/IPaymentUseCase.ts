import { Token } from "typedi";
import { IBuyPremiumSubscription, IUserAppointmentBookingResponse, WalletParams } from "../interface-types/UseCase-types";
import { BookAppointmentParams } from "../../../domain/types/appTypes";
import { VerifyPaymentParams } from "../../../domain/types/paymentParams.types";
import mongoose from "mongoose";
import { AppointmentDocument } from "../../../infrastructure/models/appointmentModel";
import { BuyPremiumSubscriptionParams } from "../PaymentUseCase";

export interface IPaymentUseCase {
    userAppointment(
        {
            doctorId,
            patientId,
            slotId,
            amount
        }: BookAppointmentParams): Promise<IUserAppointmentBookingResponse>;
    verifyPayment({
        userId,
        razorpay_order_id,
        doctorId,
        doctorName,
        paymentType,
        subscriptionId
    }: VerifyPaymentParams): Promise<{ message: string | undefined }>;
    cancelAppointment(appointmentId: mongoose.Types.ObjectId): Promise<AppointmentDocument>;
    abortPayment(orderId: string): Promise<{
        success: boolean;
        message: string;
        note?: string;
    }>;
    walletPayment(
        {
            usecase,
            type,
            userId,
            doctorId,
            patientId,
            amount,
            slotId
        }: WalletParams): Promise<AppointmentDocument | undefined>;
    buyPremiumSubscription(
        {
            subscriptionId,
            userId
        }: BuyPremiumSubscriptionParams): Promise<IBuyPremiumSubscription>;


};
export const IPaymentUseCaseToken = new Token<IPaymentUseCase>();