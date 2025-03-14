import { Service } from "typedi";
import {
  AdditonDetails,
  IAppointmentRepository,
  IAppointmentRepositoryToken,
} from "../../application/repositories/IAppointmentRepository";
import mongoose, { PipelineStage } from "mongoose";
import { AppointmentDocument, AppointmentModel } from "../models/appointmentModel";
import { AppointmentProps } from "../../domain/types/Slot";
import { ObjectId } from "../models/UserModel";
import { QueryParams } from "../../interface/controllers/doctor/DoctorFeatController";
import { AppointmentQueryParams, PaginatedAppointments } from "../../domain/types/appointment.types";

@Service(IAppointmentRepositoryToken)
export class AppointmentRepository implements IAppointmentRepository {
  async findOverlappingAppointment(
    doctorId: mongoose.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    date: Date
  ): Promise<AppointmentDocument | null> {
    const appointments = await AppointmentModel.findOne({
      doctorId: doctorId,
      date: date,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });
    return appointments;
  }

  async createAppointment(appointment: AppointmentDocument): Promise<AppointmentDocument> {
    const response = await AppointmentModel.create(appointment);
    return response;
  }

  async updatePaymentStatus(
    id: mongoose.Types.ObjectId,
    additionalDetails: AdditonDetails,
    status: "pending" | "completed" | "failed"
  ): Promise<AppointmentDocument | null> {
    const updateFields: Partial<AppointmentDocument> = {
      paymentStatus: status,
      orderId: additionalDetails.orderId,
      paymentMethod: additionalDetails.paymentMethod,
      paymentThrough: additionalDetails.paymentThrough,
      description: additionalDetails.description,
      bank: additionalDetails.bank,
      meetingId: additionalDetails.meetingId,
    };
    if (status === "failed") {
      updateFields.status = "failed";
    }
    const response = await AppointmentModel.findOneAndUpdate(
      { slotId: id },
      updateFields,
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
          localField: "slotId",
          foreignField: "_id",
          as: "slot",
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
          path: "$slot",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$doctor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          consultationType: 1,
          date: 1,
          status: 1,
          orderId: 1,
          paymentMethod: 1,
          paymentThrough: 1,
          amount: 1,
          paymentStatus: 1,
          meetingId: 1,
          "slot.startTime": 1,
          "slot.endTime": 1,
          "doctor.name": 1,
          "doctor.profilePicture": 1,
        },
      },
    ]);
    return response;
  }

  async cancelAppointment(id: mongoose.Types.ObjectId): Promise<AppointmentDocument | null> {
    const response = await AppointmentModel.findOneAndUpdate(
      { _id: id },
      { $set: { status: "cancelled" } },
      { new: true }
    );
    return response;
  }

  async findAllAppointmentsByDocID(
    doctorId: ObjectId,
    {
      page = "1",
      limit = "10",
      sortBy = "date",
      sortOrder = "desc",
      search,
      status,
      consultationType,
      paymentStatus,
    }: AppointmentQueryParams
  ): Promise<PaginatedAppointments> {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const pipeline: any[] = [
      { $match: { doctorId } },
      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slot",
        },
      },
      { $unwind: "$slot" },
      {
        $lookup: {
          from: "users",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" },
      {
        $match: {
          ...(status && { status }),
          ...(consultationType && { consultationType }),
          ...(paymentStatus && { paymentStatus }),
        },
      },
    ];
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "patient.name": { $regex: search, $options: "i" } },
            { "patient.email": { $regex: search, $options: "i" } },
            { "slot.startTime": { $regex: search, $options: "i" } },
            { "slot.endTime": { $regex: search, $options: "i" } },
          ],
        },
      });
    }
    pipeline.push({
      $sort: {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      },
    });
    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              _id: 1,
              date: 1,
              consultationType: 1,
              status: 1,
              paymentStatus: 1,
              amount: 1,
              meetingId: 1,
              paymentMethod: 1,
              paymentThrough: 1,
              slot: { startTime: 1, endTime: 1 },
              patient: { name: 1, email: 1, profilePicture: 1 },
            },
          },
        ],
        total: [{ $count: "total" }],
      },
    });
    const [result] = await AppointmentModel.aggregate(pipeline);
    return {
      data: result.data,
      meta: {
        total: result.total[0]?.total || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((result.total[0]?.total || 0) / limitNum),
      },
    };
  }

  async findAppointmentByMeetingId(meetingId: string): Promise<AppointmentDocument | null> {
    const response = await AppointmentModel.findOne({ meetingId: meetingId }).exec();
    return response;
  }

  async findAllAppointments(userId: ObjectId): Promise<AppointmentDocument[]> {
    console.log("DoctorId", userId); 
    const details = await AppointmentModel.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(userId), 
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
        $project: {
          _id: 1,
          date: 1,
          startTime: "$slotDetails.startTime",
          endTime: "$slotDetails.endTime",
          patientName: "$patientDetails.name",
          patientProfilePic: "$patientDetails.profilePicture",
        },
      },
    ]);

    console.log("Aggregated Data:", details);
    return details;
  }
}
