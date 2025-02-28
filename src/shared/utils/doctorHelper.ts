import mongoose from "mongoose";
import { DoctorDetails } from "../../domain/entities/DoctorDetails";
import { NotificationType } from "../constants/verficationCodeTypes";
import { Notification, NotificationStatus } from "../../domain/entities/Notification";
import { Slot } from "../../domain/entities/Slot";

export function IcreateDoctorDetails(
  userId: mongoose.Types.ObjectId,
  experience: string,
  consultationFees: string,
  contactPhoneNumber: string,
  professionalEmail: string,
  officeAddress: string,
  clinicLocations: string,
  consultationLanguages: string,
  primarySpecialty: string,
  medicalLicenseNumber: string,
  gender: "Male" | "Female",
  professionalTitle: string,
  bio?: string,
  certificate?: string
) {
  return new DoctorDetails(
    new mongoose.Types.ObjectId(),
    userId,
    experience,
    consultationFees,
    contactPhoneNumber,
    professionalEmail,
    officeAddress,
    clinicLocations,
    consultationLanguages,
    primarySpecialty,
    medicalLicenseNumber,
    gender,
    professionalTitle,
    bio,
    certificate
  );
}

export function IcreateNotification(
  userId: mongoose.Types.ObjectId,
  type: NotificationType,
  message: string,
  status: NotificationStatus = "pending",
  metadata?: Record<string, any>
): Notification {
  return new Notification(userId, type, message, status, metadata);
}
export const enum ConsultationType {
  Video = "video",
  Audio = "audio",
  Chat = "chat",
}
export function IcreateSlot(
  doctorId: mongoose.Types.ObjectId,
  startTime: Date,
  endTime: Date,
  date: Date,
  consultationType: ConsultationType
): Slot {
  return new Slot(new mongoose.Types.ObjectId(), doctorId, startTime, endTime, date, consultationType);
}
