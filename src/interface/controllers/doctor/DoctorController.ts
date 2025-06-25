import { Inject, Service } from "typedi";
import { DoctorUseCase } from "../../../application/user-cases/DoctorUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { doctorRegisterSchema, emailSchema, passwordSchema, verificationCodeSchema } from "../../validations/doctorSchema";
import { clearAuthCookies, setAuthCookies } from "../../../shared/utils/setAuthCookies";
import { BAD_REQUEST, CREATED, OK } from "../../../shared/constants/http";
import { Request, Response } from "express";
import { doctorDetailsSchema, doctorUpdateSchema } from "../../validations/doctor.details.schema";
import { loginSchema, otpVerificationSchema } from "../../validations/userSchema";
import { verifyToken } from "../../../shared/utils/jwt";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import appAssert from "../../../shared/utils/appAssert";
import { IDoctorUseCaseToken } from "../../../application/user-cases/interface/IDoctorUseCase";
import { IDoctorController, IDoctorControllerToken } from "../../controllerInterface/IDoctorController";

@Service()
export class DoctorController implements IDoctorController {
  constructor(@Inject() private _doctorUseCase: DoctorUseCase) { }


  //Doctor Registration;
  registerHandler = catchErrors(async (req: Request, res: Response) => {
    const request = doctorRegisterSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { user } = await this._doctorUseCase.registerDoctor(request);
    return res.status(CREATED).json({
      success: true,
      message: "Registration successfull . An OTP has been sent to your email",
      user,
    });
  });

  // Register as Doctor 
  registerAsDoctorHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body)
    const request = doctorDetailsSchema.parse({
      ...req.body.formData,
      userAgent: req.headers["user-agent"],
    });
    const userId = stringToObjectId(req.body.userId);
    const doctorInfo = req.body.doctorInfo;
    const { doctorDetails } = await this._doctorUseCase.registerAsDoctor({
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
    const userId = stringToObjectId(req.body.userId);
    const { code } = otpVerificationSchema.parse(req.body);
    await this._doctorUseCase.verifyOtp(code, userId);
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
    const { accessToken, refreshToken, user } = await this._doctorUseCase.loginDoctor(request);
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({
        message: "Login successful",
        response: { ...user, accessToken },
      });
  });

  logoutHandler = async (req: Request, res: Response) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    const { payload } = verifyToken(accessToken || "");
    if (payload) {
      await this._doctorUseCase.logoutUser(payload);
    }
    return clearAuthCookies(res).status(OK).json({
      message: "Logout successful",
    });
  };

  //verfiy Email
  verifyEmailHandler = catchErrors(async (req: Request, res: Response) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await this._doctorUseCase.verifyEmail(verificationCode);
    return res.status(OK).json({ message: "Email verified successfully" });
  });

  updateDoctorDetailsHandler = catchErrors(async (req: Request, res: Response) => {
    const request = doctorUpdateSchema.parse(req.body);
    const { userId } = req as AuthenticatedRequest;
    const response = await this._doctorUseCase.updateDoctorDetails(userId, request);
    return res.status(OK).json({
      success: true,
      message: "Details updated successfully",
      response,
    });
  });

  updatePasswordHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId, role } = req as AuthenticatedRequest;
    appAssert(userId, BAD_REQUEST, "User not authenticated. Please login");
    const currentPassword = passwordSchema.parse(req.body.currentPassword);
    const newPassword = passwordSchema.parse(req.body.newPassword);
    await this._doctorUseCase.updatePassword({ userId, currentPassword, newPassword, role });
    return res.status(OK).json({
      success: true,
      message: "Password updated successfully",
    });
  })

  // googleAuthHandler = catchErrors(async (req: Request, res: Response) => {
  //   console.log("Google auth handler called");
  //   const  code = req.query.code;
  //   console.log("Code from google auth handler",code);
  //   if (typeof code !== 'string') {
  //     throw new Error('Invalid code query parameter');
  //   }
  //   const {accessToken,refreshToken , user} = await this._doctorUseCase.googleAuth(code);
  //   return setAuthCookies({ res, accessToken, refreshToken })
  //   .status(OK)
  //   .json({
  //     message: "Google login successful",
  //     response: { ...user, accessToken },
  //   });
  // }); 


}
