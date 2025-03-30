import { ErrorRequestHandler, Response, Request } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../../../shared/constants/http";
import { z } from "zod";
import AppError from "../../../shared/utils/AppError";
import { clearAuthCookies, REFRESH_PATH } from "../../../shared/utils/setAuthCookies";

const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
  return res.status(BAD_REQUEST).json({
    status: "fail",
    message: "Validation error",
    errors,
    timestamp: new Date().toISOString(),
  });
};

const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    status: "error",
    message: error.message,
    errorCode: error.errorCode,
    timestamp: new Date().toISOString(),
  });
};

const errorHandler: ErrorRequestHandler = (error, req: Request, res: Response, next) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers,
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    },
  };


  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }
  if (error instanceof z.ZodError) {
    return handleZodError(res, error);
  }
  if (error instanceof AppError) {
    return handleAppError(res, error);
  }

  res.status(INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: "Something went wrong. Please try again later.",
    timestamp: new Date().toISOString(),
  });
};

export default errorHandler;
