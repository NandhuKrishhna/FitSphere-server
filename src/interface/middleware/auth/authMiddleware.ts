import { NextFunction, Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { AccessTokenPayload, UserRole, verfiyToken } from "../../../shared/utils/jwt";
import appAssert from "../../../shared/utils/appAssert";
import { FORBIDDEN, UNAUTHORIZED } from "../../../shared/constants/http";

const authMiddleware = (requiredRoles: UserRole[]) => {
    return catchErrors(async (req: Request, res: Response, next: NextFunction) => {
      const token = req.cookies.accessToken;
      appAssert(token, UNAUTHORIZED, "Unauthorized. Please Log in.");
      const { payload, error } = verfiyToken<AccessTokenPayload>(token);
      appAssert(!error, UNAUTHORIZED, "Unauthorized. Please Log in.");
      appAssert(payload, UNAUTHORIZED, "Unauthorized. Please Log in."); 
      console.log("Authenticated User Payload:", payload);
      appAssert(
      requiredRoles.length === 0 || requiredRoles.includes(payload.role), 
        FORBIDDEN,
        "You do not have permission to access this resource.");
        (req as any).user = payload;
        next();
    });
  };
  export default authMiddleware;