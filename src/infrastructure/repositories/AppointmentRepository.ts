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

    async updatePaymentStatus(id: mongoose.Types.ObjectId): Promise<Appointments | null> {
        const response = await AppointmentModel.findOneAndUpdate(
            { slotId: id }, 
            { paymentStatus: "completed" },
            { new: true } 
        );
        return response;
    }
    
    async findDetailsByPatientId(userId: mongoose.Types.ObjectId): Promise<any> {
      const response = await AppointmentModel.aggregate([
        {
          $match: {
            patientId: userId,
          },
        },
        {
          $lookup: {
            from: "slots",
            localField: "patientId",
            foreignField: "patientId",
            as: "slots",
          },
        },
        {
          $unwind: {
            path: "$slots",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor",
          },
        },
        {
          $unwind: {
            path: "$doctor",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id", 
            consultationType: { $first: "$consultationType" },
            date: { $first: "$date" },
            status: { $first: "$status" },
            slots: { $first: "$slots" },
            doctor: { $first: "$doctor" },
          },
        },
        {
          $project: {
            _id: 1,
            consultationType: 1,
            date: 1,
            status: 1,
            "slots.startTime": 1,
            "slots.endTime": 1,
            "doctor.name": 1,
            "doctor.ProfilePicture": 1,
          },
        },
      ]);
    
      return response;
    }
    
  async cancelAppointment(id: mongoose.Types.ObjectId): Promise<Appointments | null> {
    const response = await AppointmentModel.findOneAndUpdate(
      { _id: id },
      { $set: { status: "cancelled" } },
      { new: true }
    );
    return response;

}

async findAllAppointmentsByDocID(doctorId: mongoose.Types.ObjectId): Promise<any> {
  const response = await AppointmentModel.aggregate([
    {
      $match: {
        doctorId: new mongoose.Types.ObjectId(doctorId),
      },
    },
    {
      $lookup: {
        from: "slots", 
        localField: "slotId", 
        foreignField: "_id",
        as: "slotDetails",
      },
    },

    {
      $unwind: {
        path: "$slotDetails",
        preserveNullAndEmptyArrays: true, 
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "patientId", 
        foreignField: "_id", 
        as: "patientDetails",
      },
    },

    {
      $unwind: {
        path: "$patientDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        consultationType: { $first: "$consultationType" },
        date: { $first: "$date" },
        status: { $first: "$status" },
        paymentStatus: { $first: "$paymentStatus" },
        amount: { $first: "$amount" },
        slotDetails: { $first: "$slotDetails" },
        patientDetails: { $first: "$patientDetails" },
      },
    },
    {
      $project: {
        _id: 1,
        consultationType: 1,
        date: 1,
        status: 1,
        paymentStatus: 1,
        amount: 1,
        "slotDetails.startTime": 1,
        "slotDetails.endTime": 1,
        "patientDetails.name": 1,
        "patientDetails.profilePicture": 1,
      },
    },
  ]);

  return response;
}



}