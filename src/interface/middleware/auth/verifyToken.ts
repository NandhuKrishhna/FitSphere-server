import { NextFunction, Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";


export class TokenHandler {
    constructor() {}


    verifyToken = catchErrors(async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        console.log(req.headers)
        console.log("This is authHeader from verifyToken middleware : ",authHeader)
        next()
    })
}