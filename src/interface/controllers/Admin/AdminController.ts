import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { loginSchema } from "../../validations/userSchema";
import { Inject, Service } from "typedi";
import { AdminUseCase } from "../../../application/user-casers/AdminUseCase";
import { access } from "fs";
import { clearAuthCookies, setAuthCookies } from "../../../shared/utils/setAuthCookies";
import { OK } from "../../../shared/constants/http";
import { verfiyToken } from "../../../shared/utils/jwt";
import mongoose from "mongoose";


@Service()
export class AdminController {
    constructor(
        @Inject() private adminUseCase : AdminUseCase
    ){}


  loginHandler = catchErrors(async (req: Request, res: Response) => {
    const doctor = loginSchema.parse({...req.body,userAgent: req.headers["user-agent"]});
   const {user , accessToken , refreshToken} = await this.adminUseCase.adminLogin(doctor);
   setAuthCookies({ res, accessToken, refreshToken });
   return res.status(OK).json({
     success : true,
     message : " Admin Login successfull",
     admin : user,
     accessToken
   })
  })

   getAllUsersHandler = catchErrors(async (req: Request, res: Response) => {
     const users = await this.adminUseCase.getAllUsers();
     return res.status(OK).json({
       success : true,
       users
   });
   })
   getAllDoctorsHandler = catchErrors(async (req: Request, res: Response) => {
     const doctors = await this.adminUseCase.getAllDoctors();
     return res.status(OK).json({
       success : true,
       doctors
   })
   })

   logoutHandler = catchErrors(async (req: Request, res: Response) => {
      const accessToken = req.cookies.accessToken as string | undefined;
         const { payload } = verfiyToken(accessToken || "");
         if (payload) {
            await this.adminUseCase.logoutAdmin(payload)
         }
         return clearAuthCookies(res).status(OK).json({
               message: "Logout successful",
             });
   })

   notificationHandler = catchErrors(async (req: Request, res: Response) => {
     const notification = await this.adminUseCase.getNotification();
     return res.status(OK).json({
       success : true,
       notification
     })
   })

   approveRequestHandler = catchErrors(async (req: Request, res: Response) => {
    const { id } = req.body;
    console.log(`Approving request for doctor ID: ${id}`);
    const updatedDoctor = await this.adminUseCase.approveRequest(id);
    console.log(`Updated Doctor:`, updatedDoctor);
    return res.status(OK).json({
      success: true,
      message: "Request Approved",
      updatedDoctor
    });
  });
  
  rejectRequestHandler = catchErrors(async (req: Request, res: Response) => {
    const { id  ,reason} = req.body;
    console.log(`Rejecting request for doctor ID: ${id}`);
    const updatedDoctor = await this.adminUseCase.rejectRequest(id , reason);
    console.log(`Updated Doctor:`, updatedDoctor);
    return res.status(OK).json({
      success: true,
      message: "Request Rejected",
      updatedDoctor
    });
  });

  getAllDoctorWithDetails = catchErrors(async (req: Request, res: Response) => {
      const doctorsWithDetails = await this.adminUseCase.findAllDoctorsDetails();
      console.log(doctorsWithDetails)
     res.status(OK).json({
      success : true,
      message:"Doctor Details  fetch successfully ",
      doctorsWithDetails
     })
  })

  unblockUserHandler = catchErrors(async (req : Request , res : Response) => {
    const {id} = req.body;
    const objectId = new mongoose.Types.ObjectId(id);
    await this.adminUseCase.unblockUser(objectId);
    return res.status(OK).json({
      success : true,
      message : "User unblocked successfully"
    })
  })

  blockUserHandler = catchErrors(async (req : Request , res : Response) => {
    const {id} = req.body;
    const objectId = new mongoose.Types.ObjectId(id);
    await this.adminUseCase.blockUser(objectId);
    return res.status(OK).json({
      success : true,
      message : "User blocked successfully"
    })
  })
  
}