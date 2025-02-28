import mongoose from "mongoose";

import { Token } from "typedi";
import { SlotDocument } from "../../domain/types/Slot";

export interface ISlotRepository {
  findSlotDetails(
    id: mongoose.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    data: Date
  ): Promise<SlotDocument | null>;
  createSlot(slot: SlotDocument): Promise<SlotDocument>;
  findAllActiveSlots(doctorId: mongoose.Types.ObjectId): Promise<SlotDocument[] | null>;
  findSlotById(slotId: mongoose.Types.ObjectId): Promise<SlotDocument | null>;
  deleteSlot(doctorId: mongoose.Types.ObjectId, slotId: mongoose.Types.ObjectId): Promise<void>;
  updateSlot(id: mongoose.Types.ObjectId, updates: Partial<SlotDocument>): Promise<SlotDocument | null>;
  updateSlotById(slotId: mongoose.Types.ObjectId, patientId: mongoose.Types.ObjectId): Promise<SlotDocument | null>;
  cancelSlotById(slotId: mongoose.Types.ObjectId): Promise<void>;
}
export const ISlotRepositoryToken = new Token<ISlotRepository>();
