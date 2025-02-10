import { Service } from "typedi";
import { ISlotRepository, ISlotRepositoryToken } from "../../application/repositories/ISlotRepository";
import mongoose from "mongoose";
import { Slot } from "../../domain/entities/Slot";
import { SlotModel } from "../models/slot.models";

@Service(ISlotRepositoryToken)
export class SlotRepository  implements ISlotRepository{
    async findSlotDetails(id: mongoose.Types.ObjectId, startTime: Date, endTime: Date,date :Date): Promise<Slot | null> {
        const slotDetails = await SlotModel.findOne({
            doctorId: id,
            date,
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        })
        return slotDetails;

}

async createSlot(slot: Slot): Promise<Slot> {
    return await SlotModel.create(slot);
}

async findAllSlots(doctorId: mongoose.Types.ObjectId): Promise<Slot[]> {
    const slots = await SlotModel.find({ doctorId });
    return slots;
}

async findSlotById(slotId: mongoose.Types.ObjectId ): Promise<Slot | null> {
  return await SlotModel.findOne({_id:slotId})
}
 async deleteSlot(doctorId: mongoose.Types.ObjectId , slotId: mongoose.Types.ObjectId ): Promise<void> {
    await SlotModel.deleteOne({doctorId:doctorId, _id:slotId})
}
}