import { Inject, Service } from "typedi";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, CONFLICT, UNAUTHORIZED } from "../../shared/constants/http";
import mongoose from "mongoose";

import { SlotType } from "../../interface/validations/slot.schema";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import { IAppointmentRepository, IAppointmentRepositoryToken } from "../repositories/IAppointmentRepository";
import { IConversationRepository, IConversationRepositoryToken } from "../repositories/IConversationRepository";
import { ConsultationType, IcreateSlot } from "../../shared/utils/doctorHelper";

@Service()
export class DoctorFeatUseCase {
  constructor(
    @Inject(ISlotRepositoryToken) private slotRepository: ISlotRepository,
    @Inject(IAppointmentRepositoryToken) private appointmentRepository: IAppointmentRepository,
    @Inject(IConversationRepositoryToken) private conversationRepository: IConversationRepository
  ) {}

  async addSlots(doctorId: mongoose.Types.ObjectId, payload: SlotType) {
    console.log(`Doctor Id: ${doctorId} and slots: ${JSON.stringify(payload)}`);
    const existingSlots = await this.slotRepository.findSlotDetails(
      doctorId,
      payload.startTime,
      payload.endTime,
      payload.date
    );
    appAssert(!existingSlots, CONFLICT, "Slot already exists");
    const { startTime, endTime } = payload;
    appAssert(startTime < endTime, BAD_REQUEST, "End time must be after start time");
    let type = payload.consultationType === "video" ? ConsultationType.Video : ConsultationType.Audio;
    const newSlot = IcreateSlot(doctorId, startTime, endTime, payload.date, type);

    const newSlotDetails = await this.slotRepository.createSlot(newSlot);
    console.log("New Slots : ", newSlotDetails);
    return newSlotDetails;
  }

  async displayAllSlots(doctorId: mongoose.Types.ObjectId) {
    const slots = await this.slotRepository.findAllActiveSlots(doctorId);
    return slots;
  }

  async cancelSlot(doctorId: mongoose.Types.ObjectId, slotId: mongoose.Types.ObjectId) {
    const existingSlot = await this.slotRepository.findSlotById(slotId);
    appAssert(existingSlot?.status !== "booked", UNAUTHORIZED, "Patient has already booked this slot.");
    await this.slotRepository.deleteSlot(doctorId, slotId);
  }

  async getAllAppointment(
    doctorId: mongoose.Types.ObjectId,
    filters: { status?: string; paymentStatus?: string; consultationType?: string },
    page: number,
    limit: number
  ) {
    const { data, total } = await this.appointmentRepository.findAllAppointmentsByDocID({
      doctorId,
      filters,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit);
    return { appointments: data, total, page, totalPages };
  }

  async getAllUsers(userId: mongoose.Types.ObjectId, role: string): Promise<any> {
    const users = await this.conversationRepository.getUsers(userId, role);
    return users;
  }
}
