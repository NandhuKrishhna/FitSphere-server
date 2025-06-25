import { Token } from "typedi";
import { SlotDocument } from "../../../infrastructure/models/slot.models";
import { SlotType } from "../../../interface/validations/slot.schema";
import mongoose from "mongoose";
import { PaginatedAppointments } from "../../../domain/types/appointment.types";
import { QueryResult } from "../../../domain/types/conversation.types";
import { IProfilePageDetailsResponse } from "../interface-types/UseCase-types";
import { ObjectId } from "../../../infrastructure/models/UserModel";

export interface IDoctorFeatUseCase {
    addSlots(doctorId: mongoose.Types.ObjectId, payload: SlotType): Promise<SlotDocument>;
    displayAllSlots(doctorId: mongoose.Types.ObjectId): Promise<SlotDocument[] | null>;
    cancelSlot(doctorId: mongoose.Types.ObjectId, slotId: mongoose.Types.ObjectId): Promise<void>;
    getAllAppointment(userId: mongoose.Types.ObjectId, queryParams: any, role: string): Promise<PaginatedAppointments>;
    getAllUsers(userId: mongoose.Types.ObjectId, role: string): Promise<QueryResult>;
    getDoctorDetails({ userId }: { userId: ObjectId }): Promise<void>;
    profilePageDetails(userId: ObjectId): Promise<IProfilePageDetailsResponse>
};
export const IDoctorFeatUseCaseToken = new Token<IDoctorFeatUseCase>();