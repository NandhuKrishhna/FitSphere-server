import mongoose from "mongoose";
import { Appointment, Appointments } from "../../domain/entities/Appointments";
import { Token } from "typedi";
import { AppointmentProps } from "../../domain/types/Slot";
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
  ): Promise<Appointment | null>;
  createAppointment(appointment: Appointment): Promise<Appointment>;
  updatePaymentStatus(
    id: mongoose.Types.ObjectId,
    additionalDetails: AdditonDetails,
    status: string
  ): Promise<Appointment | null>;
  findDetailsByPatientId(userId: mongoose.Types.ObjectId): Promise<any>;
  cancelAppointment(id: mongoose.Types.ObjectId): Promise<Appointment | null>;
  findAllAppointmentsByDocID(props: AppointmentProps): Promise<{ data: any[]; total: number }>;
  findAppointmentByMeetingId(meetingId: string): Promise<Appointment | null>;
}

export const IAppointmentRepositoryToken = new Token<IAppointmentRepository>();
