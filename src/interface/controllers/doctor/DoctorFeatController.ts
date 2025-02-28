import { Inject, Service } from "typedi";
import catchErrors from "../../../shared/utils/catchErrors";
import { verificationCodeSchema } from "../../validations/doctorSchema";
import { OK } from "../../../shared/constants/http";
import { Request, Response } from "express";
import { SlotType } from "../../validations/slot.schema";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import { convertToISTWithOffset } from "../../../shared/utils/date";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { DoctorFeatUseCase } from "../../../application/user-casers/DoctorFeatUseCase";

@Service()
export class DoctorFeatController {
  constructor(@Inject() private doctorFeatUseCase: DoctorFeatUseCase) {}

  slotManagementHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { slots } = req.body;
    console.log(req.body);
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
      console.log("After converting to Indian Time  : ", payload);
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
    console.log("Req body : ", req.body);
    const slotId = stringToObjectId(req.body.slotId);
    const { userId } = req as AuthenticatedRequest;
    await this.doctorFeatUseCase.cancelSlot(userId, slotId);
    res.status(OK).json({
      success: true,
      message: "Slot cancelled successfully",
    });
  });

  getAllAppointmentsHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body);
    const doctorId = stringToObjectId(req.body.userId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = 8;
    const filters = {
      status: req.query.status as string,
      paymentStatus: req.query.paymentStatus as string,
      consultationType: req.query.consultationType as string,
    };
    const response = await this.doctorFeatUseCase.getAllAppointment(doctorId, filters, page, limit);
    return res.status(OK).json({
      success: true,
      response,
    });
  });

  getUsersInSideBarHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { role } = req as AuthenticatedRequest;
    const users = await this.doctorFeatUseCase.getAllUsers(userId, role);
    console.log(users);
    res.status(OK).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  });
}
