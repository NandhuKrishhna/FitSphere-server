import { Inject, Service } from "typedi";
import { DoctorUseCase } from "../../../application/user-casers/DoctorUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { doctorRegisterSchema, verificationCodeSchema } from "../../validations/doctorSchema";
import { setAuthCookies } from "../../../shared/utils/setAuthCookies";
import { CREATED, OK } from "../../../shared/constants/http";
import { Request, Response } from "express";
import { doctorDetailsSchema } from "../../validations/doctor.details.schema";
import mongoose from "mongoose";
import { otpVerificationSchema } from "../../validations/userSchema";
import { verfiyToken } from "../../../shared/utils/jwt";

@Service()

export class DoctorController {
  constructor(
    @Inject() private doctorUseCase: DoctorUseCase,
 ) {}

  registerHandler = catchErrors(async (req: Request, res: Response) => {
    const request = doctorRegisterSchema.parse({...req.body,userAgent: req.headers["user-agent"],});
    const { user, accessToken, refreshToken } =
    await this.doctorUseCase.registerDoctor(request);
    (req.session as any)._id = user._id;
    return setAuthCookies({ res, accessToken, refreshToken }).status(CREATED).json({
      success:true,
      message: "Registration successfull . An OTP has been sent to your email",
      user
    });
  });

  // register as doctor handler
  registerAsDoctorHandler = catchErrors(async (req: Request, res: Response) => {
    const request = doctorDetailsSchema.parse({...req.body,userAgent: req.headers["user-agent"],})
    // const {ProfilePicture} = req.body;
    // console.log("Profile picture",ProfilePicture)
    // console.log(request,"Register as doctor details from the backend")
     const token = req.cookies.accessToken;
     const {payload} = verfiyToken(token);
     const userId = payload!.userId;
    const {doctorDetails} =   await this.doctorUseCase.registerAsDoctor({ userId, details: request });
    return res.status(CREATED).json({
      success: true,
      doctorDetails,
      message: "Registration successfull . Please check your email"
    });
  });
    // otp verification
  otpVerifyHandler = catchErrors(async(req:Request, res:Response) => {
    const userId = (req.session as any)._id;
    console.log(userId , "Doctor otp handler destructing userId from session")
    const {code} = otpVerificationSchema.parse(req.body);
    await this.doctorUseCase.verifyOtp(code ,userId); 
    return res.status(OK).json({
      success : true,
      message: "Email was successfully verified . Now you can register as Doctor",
    }); 

});




  //verfiy Email
  verifyEmailHandler = catchErrors(async (req: Request, res: Response) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await this.doctorUseCase.verifyEmail(verificationCode);
    return res.status(OK).json({ message: "Email verified successfully" });

  })
}
