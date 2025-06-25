import { NextFunction, Request, RequestHandler, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { UserRole, verifyToken } from "../../../shared/utils/jwt";
import appAssert from "../../../shared/utils/appAssert";
import { UNAUTHORIZED } from "../../../shared/constants/http";
import AppErrorCode from "../../../shared/constants/appErrorCode";
import mongoose from "mongoose";
import Role from "../../../shared/constants/UserRole";
import { UserModel } from "../../../infrastructure/models/UserModel";
import { DoctorModel } from "../../../infrastructure/models/DoctorModel";
import { AdminModel } from "../../../infrastructure/models/adminModel";

export interface AuthenticatedRequest extends Request {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  role: UserRole;
  user?: any;
}

const authenticate: RequestHandler = catchErrors(async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(accessToken, UNAUTHORIZED, "Not authorized", AppErrorCode.InvalidAccessToken);

  const { error, payload } = verifyToken(accessToken);

  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );

  (req as AuthenticatedRequest).userId = payload.userId;
  (req as AuthenticatedRequest).sessionId = payload.sessionId;
  (req as AuthenticatedRequest).role = payload.role;

  let user;

  if (payload.role === Role.USER) {
    user = await UserModel.findById(payload.userId);
    appAssert(user?.status !== "blocked", UNAUTHORIZED, AppErrorCode.AccountSuspended);
  } else if (payload.role === Role.DOCTOR) {
    user = await DoctorModel.findById(payload.userId);
    appAssert(user?.status !== "blocked", UNAUTHORIZED, AppErrorCode.AccountSuspended);
    appAssert(user?.isApproved, UNAUTHORIZED, AppErrorCode.AccountNotApproved);
  } else if (payload.role === Role.ADMIN) {
    user = await AdminModel.findById(payload.userId);
  }

  appAssert(user, UNAUTHORIZED, "User not found", AppErrorCode.UserNotFound);

  (req as AuthenticatedRequest).user = user;
  next();
});

export default authenticate;
