import { NextFunction, Request, RequestHandler, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { AuthenticatedRequest } from "./authMiddleware";
import appAssert from "../../../shared/utils/appAssert";
import { FORBIDDEN, UNAUTHORIZED } from "../../../shared/constants/http";
import AppErrorCode from "../../../shared/constants/appErrorCode";

const authorizeRoles = (requiredRoles: string[]): RequestHandler =>
    catchErrors(async (req: Request, res: Response, next: NextFunction) => {
      const { role } = req as AuthenticatedRequest;
      console.log("Role From AuthorizeRole Middleware : " , role)
    console.log(role,"From authorizeRoles")
      appAssert(
        role,
        UNAUTHORIZED,
        "User role not found",
        AppErrorCode.MissingRole
      );
  
      appAssert(
        requiredRoles.includes(role),
        FORBIDDEN,
        "You do not have permission to access this resource",
        AppErrorCode.InsufficientPermission
      );
  
      next();
    });
  
  export default authorizeRoles;