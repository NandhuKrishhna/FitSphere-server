import { Request, response, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { loginSchema } from "../../validations/userSchema";
import { Inject, Service } from "typedi";
import { AdminUseCase } from "../../../application/user-casers/AdminUseCase";
import { clearAuthCookies, setAuthCookies } from "../../../shared/utils/setAuthCookies";
import { BAD_REQUEST, CREATED, OK } from "../../../shared/constants/http";
import { verfiyToken } from "../../../shared/utils/jwt";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { DoctorQueryParams, UserQueryParams } from "../../../domain/types/queryParams.types";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import premiumSubscriptionSchema, { editPremiumSubscriptionSchema } from "../../validations/premiumSubscriptionSchema";
import appAssert from "../../../shared/utils/appAssert";
import { IAdminUseCaseToken } from "../../../application/user-casers/interface/IAdminUseCase";
import { IAdminController, IAdminControllerToken } from "../../../application/repositories/IAdminController";

@Service()
export class AdminController implements IAdminController {
  constructor(@Inject() private adminUseCase: AdminUseCase) { }

  loginHandler = catchErrors(async (req: Request, res: Response) => {
    const doctor = loginSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });
    const { user, accessToken, refreshToken } = await this.adminUseCase.adminLogin(doctor);
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
    const queryParams: UserQueryParams = req.query;
    const users = await this.adminUseCase.getAllUsers(queryParams);
    return res.status(OK).json({
      success: true,
      users,
    });
  });
  getAllDoctorsHandler = catchErrors(async (req: Request, res: Response) => {
    const queryParams: DoctorQueryParams = req.query;
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
    const updatedDoctor = await this.adminUseCase.approveRequest(id);
    return res.status(OK).json({
      success: true,
      message: "Request Approved",
      newDoctor: updatedDoctor,
    });
  });

  rejectRequestHandler = catchErrors(async (req: Request, res: Response) => {
    const { id, reason } = req.body;
    await this.adminUseCase.rejectRequest(id, reason);
    return res.status(OK).json({
      success: true,
      message: "Request Rejected",
    });
  });

  getAllDoctorWithDetails = catchErrors(async (req: Request, res: Response) => {
    const doctorsWithDetails = await this.adminUseCase.findAllDoctorsDetails();
    res.status(OK).json({
      success: true,
      message: "Doctor Details  fetch successfully ",
      doctorsWithDetails,
    });
  });

  unblockUserHandler = catchErrors(async (req: Request, res: Response) => {
    const { id, role } = req.body;
    const objectId = stringToObjectId(id);
    const response = await this.adminUseCase.unblockUser(objectId, role);
    return res.status(OK).json({
      success: true,
      message: "User unblocked successfully",
      updatedUser: response
    });
  });

  blockUserHandler = catchErrors(async (req: Request, res: Response) => {
    const { id, role } = req.body;
    const objectId = stringToObjectId(id);
    const response = await this.adminUseCase.blockUser(objectId, role);
    console.log(response)
    return res.status(OK).json({
      success: true,
      message: "User blocked successfully",
      updatedUser: response
    });
  });


  addingPremiumSubscription = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { type, price, features, planName } = premiumSubscriptionSchema.parse({ ...req.body });
    const response = await this.adminUseCase.addingPremiumSubscription({
      userId,
      type,
      price,
      features,
      planName
    });
    return res.status(CREATED).json({
      success: true,
      message: "Premium subscription added successfully",
      newPremiumSubscription: response,
    });
  });

  editPremiumSubscription = catchErrors(async (req: Request, res: Response) => {
    console.log("Request", req.body)
    const { type, price, features, planName } = premiumSubscriptionSchema.parse({ ...req.body });
    const subscriptionId = stringToObjectId(req.body._id);
    appAssert(subscriptionId, BAD_REQUEST, "Invalid subscription id")

    const response = await this.adminUseCase.editPremiumSubscription({
      type,
      price,
      features,
      planName
    }, subscriptionId)
    return res.status(OK).json({
      success: true,
      message: "Premium subscription edited successfully",
      updatedPremiumSubscription: response
    })
  });

  deletePremiumSubscription = catchErrors(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subcriptionId = stringToObjectId(id);
    await this.adminUseCase.deletePremiumSubscription(subcriptionId);
    return res.status(OK).json({
      success: true,
      message: "Premium subscription deleted successfully",

    })
  })

  getAllPremiumSubscription = catchErrors(async (req: Request, res: Response) => {
    const response = await this.adminUseCase.getAllPremiumSubscription();
    return res.status(OK).json({
      success: true,
      subscriptionPlan: response
    })
  })

  adminDasBoardHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest
    const response = await this.adminUseCase.adminDashboard(userId);
    return res.status(OK).json({
      success: true,
      ...response
    })
  })

}



