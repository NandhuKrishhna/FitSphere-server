import mongoose, { Types } from "mongoose"

export type BookAppointmentParams ={
    doctorId: mongoose.Types.ObjectId,
    patientId: mongoose.Types.ObjectId,
    slotId : mongoose.Types.ObjectId,
    amount : number
};


export type SendMessageProps={
    senderId : Types.ObjectId,
    receiverId : Types.ObjectId,
    message : string,
    image ?: string
}

export type ParticipantsType = {
    senderId : Types.ObjectId,
    receiverId : Types.ObjectId
}