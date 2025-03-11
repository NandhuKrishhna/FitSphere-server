import { Service } from "typedi";
import {
  AdditonDetails,
  IAppointmentRepository,
  IAppointmentRepositoryToken,
} from "../../application/repositories/IAppointmentRepository";
import mongoose, { PipelineStage } from "mongoose";
import { AppointmentDocument, AppointmentModel } from "../models/appointmentModel";
import { AppointmentProps } from "../../domain/types/Slot";

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
    status: string
  ): Promise<AppointmentDocument | null> {
    const response = await AppointmentModel.findOneAndUpdate(
      { slotId: id },
      {
        paymentStatus: status,
        orderId: additionalDetails.orderId,
        paymentMethod: additionalDetails.paymentMethod,
        paymentThrough: additionalDetails.paymentThrough,
        description: additionalDetails.description,
        bank: additionalDetails.bank,
      },
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
          orderId: { $first: "$orderId" },
          paymentMethod: { $first: "$paymentMethod" },
          paymentThrough: { $first: "$paymentThrough" },
          amount: { $first: "$amount" },
          paymentStatus: { $first: "$paymentStatus" },
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
          "slots.startTime": 1,
          "slots.endTime": 1,
          "doctor.name": 1,
          "doctor.profilePicture": 1,
          paymentStatus: 1,
        },
      },
    ]);

    return response;
  }

  async cancelAppointment(id: mongoose.Types.ObjectId): Promise<AppointmentDocument | null> {
    const response = await AppointmentModel.findOneAndUpdate(
      { _id: id },
      { $set: { status: "available" } },
      { new: true }
    );
    return response;
  }

  async findAllAppointmentsByDocID({
    doctorId,
    filters,
    page,
    limit,
  }: AppointmentProps): Promise<{ data: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          doctorId,
          ...(filters.status && { status: filters.status }),
          ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
          ...(filters.consultationType && { consultationType: filters.consultationType }),
        },
      },
      { $sort: { createdAt: -1 as 1 | -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
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
          ],
        },
      },
    ];

    const result = await AppointmentModel.aggregate(pipeline);
    return {
      data: result[0].data,
      total: result[0].metadata[0]?.total || 0,
    };
  }

  async findAppointmentByMeetingId(meetingId: string): Promise<AppointmentDocument | null> {
    const response = await AppointmentModel.findOne({ meetingId: meetingId }).exec();
    return response;
  }
}
