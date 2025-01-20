import { ErrorRequestHandler } from "express";
import { INTERNAL_SERVER_ERROR } from "../../../shared/constants/http";


const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.error(`PATH: ${req.path}, METHOD: ${req.method}, ERROR: ${error.message}`);
    res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
  };
  
  export default errorHandler;
  