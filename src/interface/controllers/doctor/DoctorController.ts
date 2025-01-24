import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { Inject, Service } from "typedi";
import { DoctorUseCase } from "../../../application/user-casers/DoctorUseCase";
import { doctorRegisterSchema } from "../../validations/doctorSchema";
import { CREATED, UNAUTHORIZED } from "../../../shared/constants/http";
import { setAuthCookies } from "../../../shared/utils/setAuthCookies";
import { doctorDetailsSchema } from "../../validations/doctor.details.schema";
import { verfiyToken } from "../../../shared/utils/jwt";
import appAssert from "../../../shared/utils/appAssert";
import { verificationCodeSchema } from "../../validations/userSchema";
import { json } from "stream/consumers";
import { OK } from "../../../shared/constants/http";
import { string } from "zod";
interface RequestWithUser extends Request {
  user: { id: string };
}
@Service()
export class DoctorController {
  // di
  constructor(@Inject() private doctorUseCase: DoctorUseCase) {}

  // doctor register handler
  registerHandler = catchErrors(async (req: Request, res: Response) => {
    // validate the request schema
    const request = doctorRegisterSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    // send the request to the use case
    const { user, accessToken, refreshToken } =
      await this.doctorUseCase.registerDoctor(request);
    
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json(user);
  });

  // register as doctor handler
  registerAsDoctorHandler = catchErrors(async (req: Request, res: Response) => {
    // validate the request schema
    const request = doctorDetailsSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    })
    const accessToken = req.cookies.accessToken as string | undefined;
    const { payload } = verfiyToken(accessToken || "");

    const { userId } = payload || {};
    console.log(userId);
    if(userId !== undefined){
    const {doctorDetails} =   await this.doctorUseCase.registerAsDoctor({ userId, details: request });
    return res.status(CREATED).json({
      doctorDetails,
      message: "Registration successful",
     });
    } 

      
  })

  //verfiy Email
  verifyEmailHandler = catchErrors(async (req: Request, res: Response) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await this.doctorUseCase.verifyEmail(verificationCode);
    return res.status(OK).json({ message: "Email verified successfully" });

  })
}
