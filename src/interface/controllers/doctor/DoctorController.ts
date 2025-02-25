import { Inject, Service } from "typedi";
import { DoctorUseCase } from "../../../application/user-casers/DoctorUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { doctorRegisterSchema, verificationCodeSchema } from "../../validations/doctorSchema";
import { clearAuthCookies, setAuthCookies } from "../../../shared/utils/setAuthCookies";
import { CREATED, OK } from "../../../shared/constants/http";
import { Request, Response } from "express";
import { doctorDetailsSchema } from "../../validations/doctor.details.schema";
import { loginSchema, otpVerificationSchema } from "../../validations/userSchema";
import { verfiyToken } from "../../../shared/utils/jwt";
import { SlotType } from "../../validations/slot.schema";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import { convertToIST, convertToISTWithOffset } from "../../../shared/utils/date";
import { stringToObjectId } from "../../../shared/utils/bcrypt";

@Service()
export class DoctorController {
  constructor(@Inject() private doctorUseCase: DoctorUseCase) {}

  registerHandler = catchErrors(async (req: Request, res: Response) => {
    const request = doctorRegisterSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { user, accessToken, refreshToken } = await this.doctorUseCase.registerDoctor(request);
    return setAuthCookies({ res, accessToken, refreshToken }).status(CREATED).json({
      success: true,
      message: "Registration successfull . An OTP has been sent to your email",
      user,
    });
  });

  // register as doctor handler
  registerAsDoctorHandler = catchErrors(async (req: Request, res: Response) => {
    const request = doctorDetailsSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { userId } = req as AuthenticatedRequest;
    const { doctorDetails } = await this.doctorUseCase.registerAsDoctor({
      userId,
      details: request,
    });
    return res.status(CREATED).json({
      success: true,
      doctorDetails,
      message: "Registration successfull . Please check your email",
    });
  });

  // otp verification
  otpVerifyHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = stringToObjectId(req.body.userId);
    const { code } = otpVerificationSchema.parse(req.body);
    await this.doctorUseCase.verifyOtp(code, userId);
    return res.status(OK).json({
      success: true,
      message: "Email was successfully verified . Now you can register as Doctor",
    });
  });

  doctorLoginHandler = catchErrors(async (req: Request, res: Response) => {
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { accessToken, refreshToken, doctor } = await this.doctorUseCase.loginDoctor(request);
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({
        message: "Login successful",
        response: { ...doctor, accessToken },
      });
  });

  logoutHandler = async (req: Request, res: Response) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    const { payload } = verfiyToken(accessToken || "");
    if (payload) {
      await this.doctorUseCase.logoutUser(payload);
    }
    return clearAuthCookies(res).status(OK).json({
      message: "Logout successful",
    });
  };

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

        const slot = await this.doctorUseCase.addSlots(userId, payload);
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
      const response = await this.doctorUseCase.addSlots(userId, payload);
      return res.status(OK).json({
        success: true,
        message: "Slot added successfully",
        response,
      });
    }
  });

  displayAllSlotsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const response = await this.doctorUseCase.displayAllSlots(userId);
    return res.status(OK).json({
      success: true,
      response,
    });
  });
  cancelSlotHandler = catchErrors(async (req: Request, res: Response) => {
    console.log("Req body : ", req.body);
    const slotId = stringToObjectId(req.body.slotId);
    const { userId } = req as AuthenticatedRequest;
    await this.doctorUseCase.cancelSlot(userId, slotId);
    res.status(OK).json({
      success: true,
      message: "Slot cancelled successfully",
    });
  });

  //verfiy Email
  verifyEmailHandler = catchErrors(async (req: Request, res: Response) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await this.doctorUseCase.verifyEmail(verificationCode);
    return res.status(OK).json({ message: "Email verified successfully" });
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
    const response = await this.doctorUseCase.getAllAppointment(doctorId, filters, page, limit);
    return res.status(OK).json({
      success: true,
      response,
    });
  });

  getUsersInSideBarHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { role } = req as AuthenticatedRequest;
    const users = await this.doctorUseCase.getAllUsers(userId, role);
    console.log(users);
    res.status(OK).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  });
}
