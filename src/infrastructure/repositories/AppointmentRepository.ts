import { Service } from "typedi";
import {
  AdditonDetails,
  IAppointmentRepository,
  IAppointmentRepositoryToken,
} from "../../application/repositories/IAppointmentRepository";
import mongoose, { PipelineStage } from "mongoose";
import { AppointmentDocument, AppointmentModel } from "../models/appointmentModel";
import { ObjectId } from "../models/UserModel";
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
    id: string,
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
      { orderId: id },
      updateFields,
      { new: true }
    );

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

  async findAllAppointmentByUserIdAndRole(
    userId: ObjectId,
    {
      page = "1",
      limit = "10",
      sortBy = "date",
      sortOrder = "desc",
      search,
      status,
      consultationType,
      paymentStatus,
    }: AppointmentQueryParams,
    role: string
  ): Promise<PaginatedAppointments> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const matchCondition =
      role === "user"
        ? { patientId: new mongoose.Types.ObjectId(userId) }
        : { doctorId: new mongoose.Types.ObjectId(userId) };

    const pipeline: any[] = [
      { $match: matchCondition },

      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slot",
        },
      },
      { $unwind: { path: "$slot", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: role === "user" ? "doctors" : "users",
          localField: role === "user" ? "doctorId" : "patientId",
          foreignField: "_id",
          as: "otherUser",
        },
      },
      { $unwind: { path: "$otherUser", preserveNullAndEmptyArrays: true } },
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
            { "otherUser.name": { $regex: search, $options: "i" } },
            { "otherUser.email": { $regex: search, $options: "i" } },
            { "slot.startTime": { $regex: search, $options: "i" } },
            { "slot.endTime": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Sorting
    pipeline.push({
      $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
    });

    // Pagination and projection
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
              otherUser: { name: 1, email: 1, profilePicture: 1 },
            },
          },
        ],
        total: [{ $count: "total" }],
      },
    });

    // Execute aggregation pipeline
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

    return details;
  }

  async updateMeetingStatus(meetingId: string): Promise<void> {
    await AppointmentModel.findOneAndUpdate(
      { meetingId: meetingId },
      { $set: { status: "completed", meetingId: "" } }
    );
  }

}
