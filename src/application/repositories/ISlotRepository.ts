import mongoose from "mongoose";
import { Slot } from "../../domain/entities/Slot";
import { Token } from "typedi";


export interface ISlotRepository {
    findSlotDetails(id: mongoose.Types.ObjectId, startTime: Date, endTime: Date,data :Date): Promise<Slot | null>
    createSlot(slot: Slot): Promise<Slot>;
    findAllSlots(doctorId: mongoose.Types.ObjectId): Promise<Slot[]>
    findSlotById(slotId:mongoose.Types.ObjectId ): Promise<Slot | null >;
    deleteSlot(doctorId : mongoose.Types.ObjectId , slotId: mongoose.Types.ObjectId  ): Promise<void>
}
export const ISlotRepositoryToken = new Token<ISlotRepository>();


