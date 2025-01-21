import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import Container, { Inject, Service } from "typedi";
import { CREATED, OK } from "../../../shared/constants/http";
import { RegisterUserUseCase } from "../../../application/user-casers/RegisterUserUseCase";
import { loginSchema, userRegisterSchema } from "../../validations/userSchema";
import { setAuthCookies } from "../../../shared/utils/setAuthCookies";


@Service()
export class UserController{
   constructor(@Inject() private registerUserUseCase: RegisterUserUseCase){}
       //  user register handler
       registerHandler = catchErrors(async(req: Request, res: Response)=>{
       const request = userRegisterSchema.parse({
         ...req.body,
         userAgent: req.headers["user-agent"]
       })
       const {user , accessToken,refreshToken} = await this.registerUserUseCase.registerUser(request)
        
        return setAuthCookies({res, accessToken, refreshToken}) 
        .status(CREATED).json(user);
     })

     // user login handler
     loginHandler = catchErrors(async(req:Request, res: Response)=>{
      const request = loginSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"]
      })
     const {accessToken,refreshToken,user} =  await this.registerUserUseCase.loginUser(request)
     return setAuthCookies({res, accessToken, refreshToken}) 
     .status(OK).json({
      message : "Login successful",
     });

     })
}