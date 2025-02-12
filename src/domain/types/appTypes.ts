import mongoose from "mongoose"

export type BookAppointmentParams ={
    doctorId: mongoose.Types.ObjectId,
    patientId: mongoose.Types.ObjectId,
    slotId : mongoose.Types.ObjectId,
    amount : number
}