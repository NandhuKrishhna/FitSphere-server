import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { BAD_REQUEST, OK } from "../../../shared/constants/http";
import appAssert from "../../../shared/utils/appAssert";
import { verfiyToken } from "../../../shared/utils/jwt";
import { Inject, Service } from "typedi";
import { AppUseCase } from "../../../application/user-casers/AppUseCase";
import razorpay from "razorpay";
import mongoose, { Mongoose } from "mongoose";
import { clearAuthCookies } from "../../../shared/utils/setAuthCookies";
import { validateHeaderName } from "http";



@Service()
export class AppController {
    constructor(
      @Inject() private appUseCase : AppUseCase  
    ) {}

    displayAllDoctorsHandler = catchErrors(async (req: Request, res: Response) => {
        const page = req.query.page ? parseInt(req.query.page as string) - 1 : 0;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
        const search = req.query.search ? (req.query.search as string).trim() : "";
        let sort = req.query.sort ? (req.query.sort as string).split(",") : ["_id"];
        console.log(req.cookies.refreshToken,"From display all doctor handler");
    
        const { doctors ,total}   = await this.appUseCase.displayAllDoctors({page , limit , search , sort});
        // console.log(doctors , "from display all doctor")
        return res.status(OK).json({
          success : true ,
          message : "Doctors fetched successfully",
          doctors,
          pagination:{
            total,
            currentPage : page + 1,
            totalPages : Math.ceil(total / limit),
            limit
          }
        })
      });
    
      updateProfileHandler = catchErrors(async (req: Request, res: Response) => {
        const { profilePic } = req.body;
        console.log(req.body , ">>>>>...")
        appAssert(profilePic, BAD_REQUEST, "Profile picture is required");
        const token = req.cookies.accessToken;
        const {payload} = verfiyToken(token)
        const userId = payload!.userId
        console.log("userId from updateProfileHandler", userId);
    
       const  updatedUser =  await this.appUseCase.updateProfile(userId, profilePic);
       res.status(OK).json({
        message: "Profile picture updated successfully",
        user: updatedUser
       })
      });
    

      // display doctor details in the user side 
      doctorDetailsHandler = catchErrors(async (req: Request, res: Response) => {
        const doctorId = new mongoose.Types.ObjectId(req.body.doctorId)
        console.log(doctorId," from doctor details handler");
          appAssert(doctorId, BAD_REQUEST, "Doctor Id is required");
         const doctorDetails =  await this.appUseCase.displayDoctorDetails(doctorId);
         res.status(OK).json({
            success : true,
            message :"Doctor details fetched successfully",
            doctorDetails
         })
      })

      getSlotsHandler = catchErrors(async (req: Request, res: Response) => {
        console.log("From get slots handler",req.body)
        const doctorId = new mongoose.Types.ObjectId(req.body.doctorId)
        console.log(doctorId, " from get slots handler");
        appAssert(doctorId, BAD_REQUEST, "Doctor Id is required");
        const slots = await this.appUseCase.getSlots(doctorId);
        res.status(OK).json({
          success : true,
          message :"Slots fetched successfully",
          slots
        })
      })
      
    //handler to make payment of appointment using razorpay
      bookAppointment = catchErrors(async (req: Request, res: Response) => {
       console.log("From book appointment handler",req.body);
       const {slotId,amount,doctorId , patientId,} = req.body;
       const appointmentDetails = await this.appUseCase.userAppointment({slotId,amount,doctorId,patientId});
       res.status(OK).json({
        success : true,
        message :"Appointment booked successfully",
        appointmentDetails

      })
 
})

}