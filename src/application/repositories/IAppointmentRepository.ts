import mongoose from "mongoose";
import { Appointments } from "../../domain/entities/Appointments";
import { Token } from "typedi";



export interface IAppointmentRepository {
    findOverlappingAppointment(doctorId: mongoose.Types.ObjectId, startTime: Date, endTime: Date , date: Date): 
    Promise<Appointments | null>
    createAppointment(appointment: Appointments): Promise<Appointments>
};


export const IAppointmentRepositoryToken  = new Token<IAppointmentRepository>()