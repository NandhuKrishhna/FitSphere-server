import mongoose from "mongoose";
import { Appointment, Appointments } from "../../domain/entities/Appointments";
import { Token } from "typedi";



export interface IAppointmentRepository {
    findOverlappingAppointment(doctorId: mongoose.Types.ObjectId, startTime: Date, endTime: Date , date: Date): 
    Promise<Appointment | null>
    createAppointment(appointment: Appointment): Promise<Appointment>
    updatePaymentStatus(id:mongoose.Types.ObjectId) : Promise<Appointment | null>
    findDetailsByPatientId(userId : mongoose.Types.ObjectId) : Promise<any>
    cancelAppointment(id : mongoose.Types.ObjectId) : Promise<Appointment | null>
    findAllAppointmentsByDocID(doctorId : mongoose.Types.ObjectId) : Promise<any>
};


export const IAppointmentRepositoryToken  = new Token<IAppointmentRepository>()