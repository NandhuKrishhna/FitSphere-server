import { Service } from "typedi";
import { IAppointmentRepository, IAppointmentRepositoryToken } from "../../application/repositories/IAppointmentRepository";
import mongoose from "mongoose";
import { Appointments } from "../../domain/entities/Appointments";
import { AppointmentModel } from "../models/appointmentModel";


@Service(IAppointmentRepositoryToken)
export class AppointmentRepository implements IAppointmentRepository {
 
    async findOverlappingAppointment(doctorId: mongoose.Types.ObjectId, startTime: Date, endTime: Date, date: Date): Promise<Appointments | null> {
        const appointments = await AppointmentModel.findOne({ doctorId: doctorId, date: date, startTime: { $lt: endTime }, endTime: { $gt: startTime } });
        return appointments;
    }
    
    async createAppointment(appointment: Appointments): Promise<Appointments> {
        const response = await AppointmentModel.create(appointment);
        return response;
    }



}