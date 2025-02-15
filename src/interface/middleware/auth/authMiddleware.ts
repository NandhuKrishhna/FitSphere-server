import { NextFunction, Request, RequestHandler, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { UserRole, verfiyToken } from "../../../shared/utils/jwt";
import appAssert from "../../../shared/utils/appAssert";
import {UNAUTHORIZED } from "../../../shared/constants/http";
import AppErrorCode from "../../../shared/constants/appErrorCode";
import mongoose from "mongoose";


export interface AuthenticatedRequest extends Request {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  role: UserRole;
}
const authenticate: RequestHandler = catchErrors(async(req : Request, res : Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  console.log("AccessToken from autheticaiton middlware",accessToken)
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Not authorized",
    AppErrorCode.InvalidAccessToken
  );

  const { error, payload } = verfiyToken(accessToken);

  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );
 
    (req as AuthenticatedRequest).userId = payload.userId;
    (req as AuthenticatedRequest).sessionId = payload.sessionId;
    (req as AuthenticatedRequest).role = payload.role;
    next();
  
});


export default authenticate;
