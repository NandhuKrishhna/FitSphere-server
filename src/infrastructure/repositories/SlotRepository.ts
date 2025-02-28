import { Service } from "typedi";
import { ISlotRepository, ISlotRepositoryToken } from "../../application/repositories/ISlotRepository";
import mongoose from "mongoose";
import { SlotModel } from "../models/slot.models";
import { SlotDocument } from "../../domain/types/Slot";
function startOfTodayIST(): Date {
  const now = new Date();
  // Convert to IST and reset to start of day
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = now.getTime() + istOffset;
  const startOfDayIST = new Date(istTime);
  startOfDayIST.setUTCHours(0, 0, 0, 0);
  return new Date(startOfDayIST.getTime() - istOffset);
}
@Service(ISlotRepositoryToken)
export class SlotRepository implements ISlotRepository {
  async findSlotDetails(
    id: mongoose.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    date: Date
  ): Promise<SlotDocument | null> {
    const slotDetails = await SlotModel.findOne({
      doctorId: id,
      date,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });
    return slotDetails;
  }

  async createSlot(slot: SlotDocument): Promise<SlotDocument> {
    console.log("Slot data from Slot Repositoty : ", slot);
    return await SlotModel.create(slot);
  }

  async findAllActiveSlots(doctorId: mongoose.Types.ObjectId): Promise<SlotDocument[] | null> {
    const currentDateUTC = new Date();
    const currentDateIST = new Date(currentDateUTC.getTime() + 5.5 * 60 * 60 * 1000);
    const todayDateIST = currentDateIST.toISOString().split("T")[0];
    console.log("Today's Date (IST):", todayDateIST);
    const slots = await SlotModel.find({
      doctorId,
      date: { $gte: new Date(todayDateIST) },
    }).sort({ date: 1, startTime: 1 });

    console.log("Fetched Slots:", slots);

    return slots;
  }

  async findSlotById(slotId: mongoose.Types.ObjectId): Promise<SlotDocument | null> {
    return await SlotModel.findOne({ _id: slotId });
  }
  async deleteSlot(doctorId: mongoose.Types.ObjectId, slotId: mongoose.Types.ObjectId): Promise<void> {
    await SlotModel.deleteOne({ doctorId: doctorId, _id: slotId });
  }

  async updateSlot(id: mongoose.Types.ObjectId, updates: Partial<SlotDocument>): Promise<SlotDocument | null> {
    return await SlotModel.findOneAndUpdate({ _id: id }, updates, { new: true });
  }

  async updateSlotById(
    slotId: mongoose.Types.ObjectId,
    patientId: mongoose.Types.ObjectId
  ): Promise<SlotDocument | null> {
    const updatedSlot = await SlotModel.findOneAndUpdate(
      { _id: slotId },
      {
        $set: {
          patientId: patientId,
          updatedAt: new Date(),
        },
      }
    );

    return updatedSlot;
  }

  async cancelSlotById(slotId: mongoose.Types.ObjectId): Promise<void> {
    await SlotModel.findByIdAndUpdate(slotId, {
      $unset: { patientId: "" },
      status: "available",
      updatedAt: new Date(),
    });
  }
}
