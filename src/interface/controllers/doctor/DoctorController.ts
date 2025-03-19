import { Inject, Service } from "typedi";
import { DoctorUseCase } from "../../../application/user-casers/DoctorUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { doctorRegisterSchema, verificationCodeSchema } from "../../validations/doctorSchema";
import { clearAuthCookies, setAuthCookies } from "../../../shared/utils/setAuthCookies";
import { BAD_REQUEST, CREATED, OK } from "../../../shared/constants/http";
import { Request, Response } from "express";
import { doctorDetailsSchema, doctorUpdateSchema } from "../../validations/doctor.details.schema";
import { loginSchema, otpVerificationSchema } from "../../validations/userSchema";
import { verfiyToken } from "../../../shared/utils/jwt";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import mongoose from "mongoose";
import { SlotValidationSchema } from "../../validations/slot.schema";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import appAssert from "../../../shared/utils/appAssert";

@Service()
export class DoctorController {
  constructor(@Inject() private doctorUseCase: DoctorUseCase) {}
  //Doctor Registration;

  registerHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body);
    const request = doctorRegisterSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { user } = await this.doctorUseCase.registerDoctor(request);
    return res.status(CREATED).json({
      success: true,
      message: "Registration successfull . An OTP has been sent to your email",
      user,
    });
  });

  // register as doctor handler
  registerAsDoctorHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body);
    const request = doctorDetailsSchema.parse({
      ...req.body.formData,
      userAgent: req.headers["user-agent"],
    });
    const userId = stringToObjectId(req.body.userId);
    const doctorInfo = req.body.doctorInfo;
    const { doctorDetails } = await this.doctorUseCase.registerAsDoctor({
      userId,
      details: request,
      doctorInfo,
    });
    return res.status(CREATED).json({
      success: true,
      doctorDetails,
      message: "Registration successfull . Please check your email",
    });
  });

  // otp verification
  otpVerifyHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body);
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

  //verfiy Email
  verifyEmailHandler = catchErrors(async (req: Request, res: Response) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await this.doctorUseCase.verifyEmail(verificationCode);
    return res.status(OK).json({ message: "Email verified successfully" });
  });

  updateDoctorDetailsHandler = catchErrors(async (req: Request, res: Response) => {
    const request = doctorUpdateSchema.parse(req.body);
    const {userId} = req as AuthenticatedRequest;
    const response = await this.doctorUseCase.updateDoctorDetails(userId, request);
    return res.status(OK).json({
      success: true,
      message: "Details updated successfully",
      response,
    });
  });

  updatePasswordHandler = catchErrors(async (req: Request, res: Response) => {
    const {userId} = req as AuthenticatedRequest;
    appAssert(userId , BAD_REQUEST, "User not authenticated. Please login");
    const {currentPassword , newPassword} = req.body;
     await this.doctorUseCase.updatePassword({userId, currentPassword, newPassword});
    return res.status(OK).json({
      success: true,
      message: "Password updated successfully",
  });
})
}
