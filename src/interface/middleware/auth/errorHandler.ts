import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../../../shared/constants/http";
import { z } from "zod";
import AppError from "../../../shared/utils/AppError";
import { clearAuthCookies, REFRESH_PATH } from "../../../shared/utils/setAuthCookies";
import logger from "../../../shared/utils/logger";

const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
  return res.status(BAD_REQUEST).json({
    errors,
  });
};

const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  logger.error(`Path: ${req.path} , Method: ${req.method} , Error: ${error}`);
  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }
  if (error instanceof z.ZodError) {
    return handleZodError(res, error);
  }
  if (error instanceof AppError) {
    return handleAppError(res, error);
  }

  res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

export default errorHandler;
