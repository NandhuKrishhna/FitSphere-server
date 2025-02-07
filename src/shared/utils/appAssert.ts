import AppErrorCode from "../constants/appErrorCode";
import { HttpStatusCode } from "../constants/http";
import AppError from "./AppError";
import assert from "node:assert";

type AppAssert =(
    condition:any,
    httpsStatusCode : HttpStatusCode,
    message : string,
    appErrorCode? : AppErrorCode
) => asserts  condition;


const appAssert : AppAssert = (
    condition ,
    httpsStatusCode,
    message ,
    appErrorCode
)=> assert(condition , new AppError(httpsStatusCode, message, appErrorCode));

export default appAssert;