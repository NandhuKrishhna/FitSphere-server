import { Inject, Service } from "typedi";
import { DoctorUseCase } from "../../application/user-casers/DoctorUseCase";
import catchErrors from "../../shared/utils/catchErrors";
import { doctorRegisterSchema, verificationCodeSchema } from "../validations/doctorSchema";
import { setAuthCookies } from "../../shared/utils/setAuthCookies";
import { CREATED, OK } from "../../shared/constants/http";
import { Request, Response } from "express";
import { doctorDetailsSchema } from "../validations/doctor.details.schema";
import mongoose from "mongoose";
import { otpVerificationSchema } from "../validations/userSchema";

@Service()

export class DoctorController {
  constructor(
    @Inject() private doctorUseCase: DoctorUseCase,
 ) {}

  registerHandler = catchErrors(async (req: Request, res: Response) => {
    const request = doctorRegisterSchema.parse({...req.body,userAgent: req.headers["user-agent"],});
    const { user, accessToken, refreshToken } =
    await this.doctorUseCase.registerDoctor(request);
    return setAuthCookies({ res, accessToken, refreshToken }).status(CREATED).json(user);
  });

  // register as doctor handler
  registerAsDoctorHandler = catchErrors(async (req: Request, res: Response) => {
    const request = doctorDetailsSchema.parse({...req.body,userAgent: req.headers["user-agent"],})
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const {doctorDetails} =   await this.doctorUseCase.registerAsDoctor({ userId, details: request });
    return res.status(CREATED).json({doctorDetails,message: "Registration successful",});
    });

    // otp verification
  otpVerifyHandler = catchErrors(async(req:Request, res:Response) => {
    const {code} = otpVerificationSchema.parse(req.body);
    await this.doctorUseCase.verifyOtp(code); 
    return res.status(OK).json({message: "Email was successfully verfied",}); 

})


  //verfiy Email
  verifyEmailHandler = catchErrors(async (req: Request, res: Response) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await this.doctorUseCase.verifyEmail(verificationCode);
    return res.status(OK).json({ message: "Email verified successfully" });

  })
}
