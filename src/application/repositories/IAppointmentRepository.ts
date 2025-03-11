import mongoose from "mongoose";
import { Appointment, Appointments } from "../../domain/entities/Appointments";
import { Token } from "typedi";
import { AppointmentProps } from "../../domain/types/Slot";
import { AppointmentDocument } from "../../infrastructure/models/appointmentModel";
export type AdditonDetails = {
  orderId: string;
  paymentMethod: string;
  paymentThrough: string;
  description: string;
  bank: string;
};
export interface IAppointmentRepository {
  findOverlappingAppointment(
    doctorId: mongoose.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    date: Date
  ): Promise<AppointmentDocument | null>;
  createAppointment(appointment: Partial<AppointmentDocument>): Promise<AppointmentDocument>;
  updatePaymentStatus(
    id: mongoose.Types.ObjectId,
    additionalDetails: AdditonDetails,
    status: string
  ): Promise<AppointmentDocument | null>;
  findDetailsByPatientId(userId: mongoose.Types.ObjectId): Promise<any>;
  cancelAppointment(id: mongoose.Types.ObjectId): Promise<AppointmentDocument | null>;
  findAllAppointmentsByDocID(props: AppointmentProps): Promise<{ data: any[]; total: number }>;
  findAppointmentByMeetingId(meetingId: string): Promise<AppointmentDocument | null>;
}

export const IAppointmentRepositoryToken = new Token<IAppointmentRepository>();
