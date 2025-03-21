import { Request, response, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { loginSchema } from "../../validations/userSchema";
import { Inject, Service } from "typedi";
import { AdminUseCase } from "../../../application/user-casers/AdminUseCase";
import { clearAuthCookies, setAuthCookies } from "../../../shared/utils/setAuthCookies";
import { OK } from "../../../shared/constants/http";
import { verfiyToken } from "../../../shared/utils/jwt";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
export type UserQueryParams ={
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isVerfied?: string;
  isActive? :string;
  isApproved? : string;
  name?: string;
  email?: string;
  status? : string
}

export type DoctorQueryParams ={
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isVerified?: string;
  isActive? :string;
  isApproved? : string;
  name?: string;
  email?: string;
  status? : string
}
@Service()
export class AdminController {
  constructor(@Inject() private adminUseCase: AdminUseCase) {}

  loginHandler = catchErrors(async (req: Request, res: Response) => {
    const doctor = loginSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });
    const { user, accessToken, refreshToken } = await this.adminUseCase.adminLogin(doctor);
    console.log(user);
    setAuthCookies({ res, accessToken, refreshToken });
    return res.status(OK).json({
      success: true,
      message: " Admin Login successfull",
      response: {
        ...user,
        accessToken: accessToken,
      },
    });
  });

  getAllUsersHandler = catchErrors(async (req: Request, res: Response) => {
    const queryParams : UserQueryParams = req.query;
    const users = await this.adminUseCase.getAllUsers(queryParams);
    return res.status(OK).json({
      success: true,
      users,
    });
  });
  getAllDoctorsHandler = catchErrors(async (req: Request, res: Response) => {
    const queryParams : DoctorQueryParams = req.query;
    const doctors = await this.adminUseCase.getAllDoctors(queryParams);
    return res.status(OK).json({
      success: true,
      doctors,
    });
  });

  logoutHandler = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    const { payload } = verfiyToken(accessToken || "");
    if (payload) {
      await this.adminUseCase.logoutAdmin(payload);
    }
    return clearAuthCookies(res).status(OK).json({
      message: "Logout successful",
    });
  });

  notificationHandler = catchErrors(async (req: Request, res: Response) => {
    const notification = await this.adminUseCase.getNotification();
    return res.status(OK).json({
      success: true,
      notification,
    });
  });

  approveRequestHandler = catchErrors(async (req: Request, res: Response) => {
    const { id } = req.body;
    console.log(`Approving request for doctor ID: ${id}`);
    const updatedDoctor = await this.adminUseCase.approveRequest(id);
    console.log(`Updated Doctor:`, updatedDoctor);
    return res.status(OK).json({
      success: true,
      message: "Request Approved",
      updatedDoctor,
    });
  });

  rejectRequestHandler = catchErrors(async (req: Request, res: Response) => {
    const { id, reason } = req.body;
    console.log(`Rejecting request for doctor ID: ${id}`);
    const updatedDoctor = await this.adminUseCase.rejectRequest(id, reason);
    console.log(`Updated Doctor:`, updatedDoctor);
    return res.status(OK).json({
      success: true,
      message: "Request Rejected",
      updatedDoctor,
    });
  });

  getAllDoctorWithDetails = catchErrors(async (req: Request, res: Response) => {
    const doctorsWithDetails = await this.adminUseCase.findAllDoctorsDetails();
    console.log(doctorsWithDetails);
    res.status(OK).json({
      success: true,
      message: "Doctor Details  fetch successfully ",
      doctorsWithDetails,
    });
  });

  unblockUserHandler = catchErrors(async (req: Request, res: Response) => {
    const { id ,role } = req.body;
    const objectId = stringToObjectId(id);
    await this.adminUseCase.unblockUser(objectId,role);
    return res.status(OK).json({
      success: true,
      message: "User unblocked successfully",
    });
  });

  blockUserHandler = catchErrors(async (req: Request, res: Response) => {
    const { id , role } = req.body;
    console.log(req.body , id , role)
    const objectId = stringToObjectId(id);
    await this.adminUseCase.blockUser(objectId, role);
    return res.status(OK).json({
      success: true,
      message: "User blocked successfully",
    });
  });



   adminDashBoard = catchErrors(async (req: Request, res: Response) => {
       
   })
}
