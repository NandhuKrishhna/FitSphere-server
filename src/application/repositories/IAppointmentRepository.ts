import mongoose from "mongoose";
import { Token } from "typedi";
import { AppointmentDocument } from "../../infrastructure/models/appointmentModel";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { AppointmentQueryParams, PaginatedAppointments } from "../../domain/types/appointment.types";
export type AdditonDetails = {
  orderId: string;
  paymentMethod: string;
  paymentThrough: string;
  description: string;
  bank: string;
  meetingId: string;
};
export interface IAppointmentRepository {
  findOverlappingAppointment(
    doctorId: mongoose.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    date: Date
  ): Promise<AppointmentDocument | null>;
  createAppointment(appointment: Partial<AppointmentDocument>): Promise<AppointmentDocument | null>;
  updatePaymentStatus(
    id: string,
    additionalDetails: AdditonDetails,
    status: string
  ): Promise<AppointmentDocument | null>;
  findAppointmentById(id: mongoose.Types.ObjectId): Promise<AppointmentDocument | null>;
  cancelAppointment(id: mongoose.Types.ObjectId): Promise<AppointmentDocument | null>;
  findAllAppointmentByUserIdAndRole(userId: ObjectId, queryParams: AppointmentQueryParams, role: string): Promise<PaginatedAppointments>;
  findAppointmentByMeetingId(meetingId: string): Promise<AppointmentDocument | null>;
  findAllAppointments(userId: ObjectId): Promise<AppointmentDocument[]>;
  updateMeetingStatus(meetingId: string): Promise<void>;
}

export const IAppointmentRepositoryToken = new Token<IAppointmentRepository>();
