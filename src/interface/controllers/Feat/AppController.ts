import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { BAD_REQUEST, OK } from "../../../shared/constants/http";
import appAssert from "../../../shared/utils/appAssert";
import { verfiyToken } from "../../../shared/utils/jwt";
import { Inject, Service } from "typedi";
import { AppUseCase } from "../../../application/user-casers/AppUseCase";




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
          const doctorId = req.body.doctorId;
          appAssert(doctorId, BAD_REQUEST, "Doctor Id is required");
         const doctorDetails =  await this.appUseCase.displayDoctorDetails(doctorId);
         res.status(OK).json({
            success : true,
            message :"Doctor details fetched successfully",
            doctorDetails
         })
      })
      
    //book slots
      bookSlotHandler = catchErrors(async (req: Request, res: Response) => {
       console.log(req.body)
      })

}