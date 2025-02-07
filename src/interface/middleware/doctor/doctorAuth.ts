import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import appAssert from "../../../shared/utils/appAssert";
import { UNAUTHORIZED } from "../../../shared/constants/http";
import { JWT_SECRET } from "../../../shared/constants/env";

interface RequestWithUser extends Request {
    user: { id: string };
  }
const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1]; 
  console.log(token)
  appAssert(token, UNAUTHORIZED, "Unauthorized");
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    (req as RequestWithUser).user = { id: decoded.id };
    next(); 
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default verifyTokenMiddleware;
