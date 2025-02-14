import { Inject, Service } from "typedi";
import { DoctorUseCase } from "../../../application/user-casers/DoctorUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { doctorRegisterSchema, verificationCodeSchema } from "../../validations/doctorSchema";
import { clearAuthCookies, setAuthCookies } from "../../../shared/utils/setAuthCookies";
import { CREATED, OK } from "../../../shared/constants/http";
import { Request, Response } from "express";
import { doctorDetailsSchema } from "../../validations/doctor.details.schema";
import mongoose from "mongoose";
import { loginSchema, otpVerificationSchema } from "../../validations/userSchema";
import { verfiyToken } from "../../../shared/utils/jwt";
import { SlotValidationSchema } from "../../validations/slot.schema";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";

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

doctorLoginHandler =catchErrors(async(req:Request , res:Response) =>{
   const request = loginSchema.parse({
    ...req.body,
    userAgent : req.headers["user-agent"]
   });
   const {accessToken, refreshToken, user} = await this.doctorUseCase.loginDoctor(request);
   return setAuthCookies({ res, accessToken, refreshToken , }).status(OK).json({
    message: "Login successful",
    dcctor:{
      _id: user._id,
      name: user.name,
      email: user.email,
      role : user.role,
      profilePicture : user.ProfilePicture,
      accessToken,

    }
  });
})

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
  const request = req.body;
  console.log(request)
  // const response =  await this.doctorUseCase.addSlots(userId , request);
  return res.status(OK).json({
    success : true,
    message : "Slot added successfully",
    // response
  });
});

displayAllSlotsHandler = catchErrors(async (req: Request, res: Response) => {
  const token = req.cookies.accessToken;
  const {payload} = verfiyToken(token);
  const userId = payload!.userId;
  const response =  await this.doctorUseCase.displayAllSlots(userId);
  return res.status(OK).json({
    success : true,
    response
  });
});
  
cancelSlotHandler = catchErrors(async (req: Request, res: Response) => {
  const token = req.cookies.accessToken;
  const slotId = new mongoose.Types.ObjectId(req.body.slotId);
  const {payload} = verfiyToken(token);
  const userId = payload!.userId;
    await this.doctorUseCase.cancelSlot(userId, slotId);
    res.status(OK).json({
      success : true,
      message : "Slot cancelled successfully"
    })
});
  //verfiy Email
  verifyEmailHandler = catchErrors(async (req: Request, res: Response) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await this.doctorUseCase.verifyEmail(verificationCode);
    return res.status(OK).json({ message: "Email verified successfully" });

  })

  getAllAppointmentsHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.body.userId);
    console.log(userId, "from get all appointments handler");
    const response =  await this.doctorUseCase.getAllAppointment(userId);
    return res.status(OK).json({
      success : true,
      response
    });
  });

}
