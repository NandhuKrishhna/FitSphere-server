import { NextFunction, Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { AccessTokenPayload, UserRole, verfiyToken } from "../../../shared/utils/jwt";
import appAssert from "../../../shared/utils/appAssert";
import { FORBIDDEN, UNAUTHORIZED } from "../../../shared/constants/http";
import AppErrorCode from "../../../shared/constants/appErrorCode";
import mongoose from "mongoose";


export interface AuthenticatedRequest extends Request {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  role: string;
}
const authMiddleware = (requiredRoles: UserRole[]) => {
  return catchErrors(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    const refreshToken = req.cookies.refreshToken as string | undefined;

    // If access token is missing, but a refresh token exists, allow the frontend to refresh
    if (!accessToken && refreshToken) {
      return res.status(401).json({ message: "Access token expired, please refresh" });
    }

    // Check if access token exists
    appAssert(
      accessToken,
      UNAUTHORIZED,
      "Not authorized",
      AppErrorCode.InvalidAccessToken
    );

    const { error, payload } = verfiyToken(accessToken);
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    // If token is expired but refreshToken is still present, return an error asking to refresh
    if (error === "jwt expired" && refreshToken) {
      return res.status(401).json({ message: "Access token expired, please refresh" });
    }

    // If token is invalid or expired and refreshToken is also missing/invalid, force logout
    if (!payload && (!refreshToken || error === "jwt expired")) {
      return res.status(403).json({ message: "Session expired, please log in again" });
    }

    console.log("Authenticated User Payload:", payload);

    // Check user roles
    appAssert(
      requiredRoles.length === 0 || requiredRoles.includes(payload.role),
      FORBIDDEN, "You do not have permission to access this resource."
    );

    // Attach user info to request
    (req as AuthenticatedRequest).userId = payload.userId;
    (req as AuthenticatedRequest).sessionId = payload.sessionId;
    (req as AuthenticatedRequest).role = payload.role;
    next();
  });
};


export default authMiddleware
