import { Inject, Service } from "typedi";
import catchErrors from "../../../shared/utils/catchErrors";
import { verificationCodeSchema } from "../../validations/doctorSchema";
import { BAD_REQUEST, OK } from "../../../shared/constants/http";
import { Request, Response } from "express";
import { SlotType } from "../../validations/slot.schema";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import { convertToISTWithOffset } from "../../../shared/utils/date";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { DoctorFeatUseCase } from "../../../application/user-casers/DoctorFeatUseCase";
import { AppointmentQueryParams } from "../../../domain/types/appointment.types";
import appAssert from "../../../shared/utils/appAssert";
import { json } from "stream/consumers";
import { IDoctorFeatUseCaseToken } from "../../../application/user-casers/interface/IDoctorFeatUseCase";
import { IDoctorFeatController, IDoctorFeatControllerToken } from "../../../application/repositories/IDoctorFeatController";

@Service(IDoctorFeatControllerToken)
export class DoctorFeatController implements IDoctorFeatController {
  constructor(@Inject(IDoctorFeatUseCaseToken) private doctorFeatUseCase: DoctorFeatUseCase) { }

  slotManagementHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { slots } = req.body;

    if (Array.isArray(slots) && slots.length > 0) {
      const createdSlots = [];

      for (const slotData of slots) {
        const payload: SlotType = {
          startTime: convertToISTWithOffset(slotData.startTime, 5.5),
          endTime: convertToISTWithOffset(slotData.endTime, 5.5),
          date: convertToISTWithOffset(slotData.date, 5.5),
          consultationType: slotData.consultationType,
        };

        const slot = await this.doctorFeatUseCase.addSlots(userId, payload);
        createdSlots.push(slot);
      }

      return res.status(OK).json({
        success: true,
        message: `Successfully created ${createdSlots.length} slots`,
        response: createdSlots,
      });
    } else {
      const { startTime, endTime, date, consultationType } = req.body;
      const payload: SlotType = {
        startTime: convertToISTWithOffset(startTime, 5.5),
        endTime: convertToISTWithOffset(endTime, 5.5),
        date: convertToISTWithOffset(date, 5.5),
        consultationType,
      };
      const response = await this.doctorFeatUseCase.addSlots(userId, payload);
      return res.status(OK).json({
        success: true,
        message: "Slot added successfully",
        response,
      });
    }
  });

  displayAllSlotsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const response = await this.doctorFeatUseCase.displayAllSlots(userId);
    return res.status(OK).json({
      success: true,
      response,
    });
  });
  cancelSlotHandler = catchErrors(async (req: Request, res: Response) => {

    const slotId = stringToObjectId(req.body.slotId);
    const { userId } = req as AuthenticatedRequest;
    await this.doctorFeatUseCase.cancelSlot(userId, slotId);
    res.status(OK).json({
      success: true,
      message: "Slot cancelled successfully",
    });
  });

  getAllAppointmentsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId, role } = req as AuthenticatedRequest;
    const queryParams: AppointmentQueryParams = req.query;
    const response = await this.doctorFeatUseCase.getAllAppointment(userId, queryParams, role);
    return res.status(OK).json({
      success: true,
      ...response,
    });
  });

  getUsersInSideBarHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { role } = req as AuthenticatedRequest;
    const users = await this.doctorFeatUseCase.getAllUsers(userId, role);

    res.status(OK).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  });
  getDoctorDetailHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    appAssert(userId, BAD_REQUEST, "Please login or Invalid DoctorId.");
    const doctorDetails = await this.doctorFeatUseCase.getDoctorDetails({ userId });
    res.status(OK).json({
      success: true,
      message: "Doctor Details fetched successfully",
      doctorDetails,
    });
  });
  profilePageDetailsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    appAssert(userId, BAD_REQUEST, "Missing DoctorId. Try Again or Please Login");
    const profilePageDetails = await this.doctorFeatUseCase.profilePageDetails(userId);
    return res.status(OK).json({
      success: true,
      message: "Successfull",
      profilePageDetails,
    });
  });
}
