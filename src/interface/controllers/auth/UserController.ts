import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import{ Inject, Service } from "typedi";
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED, VARIANT_ALSO_NEGOTIATES } from "../../../shared/constants/http";
import { RegisterUserUseCase } from "../../../application/user-casers/RegisterUserUseCase";
import {
  emailSchema,
  loginSchema,
  otpVerificationSchema,
  resetPasswordSchema,
  userRegisterSchema,
  verificationCodeSchema,
} from "../../validations/userSchema";
import {
  clearAuthCookies,
  clearTempAuthCookies,
  generateRefreshTokenCookieOptions,
  getAccessTokenCookieOptions,
  setAuthCookies,
  setTempAuthCookies,
} from "../../../shared/utils/setAuthCookies";
import { verfiyToken, verifyResetToken } from "../../../shared/utils/jwt";
import appAssert from "../../../shared/utils/appAssert";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";



@Service()
export class UserController {
  constructor(
    @Inject() private registerUserUseCase: RegisterUserUseCase,
    
) {}
  //  user register handler
  registerHandler = catchErrors(async (req: Request, res: Response) => {
    const request = userRegisterSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { user, accessToken, refreshToken  } =
      await this.registerUserUseCase.registerUser(request);
      (req.session as any)._id = user._id;
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json({
        success : true,
        message : "Registration successful , Please verify your email",
        user:{
          _id: user._id,
          name: user.name,
          email: user.email,
          role : user.role,
          accessToken,
        }
        });
  });
  // verfiy Otp;
   otpVerifyHandler = catchErrors(async(req:Request, res:Response) => {
       const userId = (req.session as any)._id;
       console.log(userId,"From session otp verify handler");
       const {code} = otpVerificationSchema.parse(req.body);
       console.log(code,"From session otp verify handler");
       await this.registerUserUseCase.verifyOtp(code ,userId); 
       return res.status(OK).json({
        success : true,
        message: "Email was successfully verfied",
      }); 
   
   })

  // user login handler
  loginHandler = catchErrors(async (req: Request, res: Response) => {
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { accessToken, refreshToken, user } = await this.registerUserUseCase.loginUser(request);
    return setAuthCookies({ res, accessToken, refreshToken , }).status(OK).json({
      message: "Login successful",
      user:{
        _id: user._id,
        name: user.name,
        email: user.email,
        role : user.role,
        profilePicture: user.profilePicture,
        accessToken,
      }
    });
  });

  logoutHandler = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    const { payload } = verfiyToken(accessToken || "");
    if (payload) {
      await this.registerUserUseCase.logoutUser(payload);
    }
    return clearAuthCookies(res).status(OK).json({
      message: "Logout successful",
    });
  });

  refreshHandler = catchErrors(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    console.log(refreshToken,"From refresh handler");
    appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token, please log in again");
    const { accessToken, newRefreshToken } = await this.registerUserUseCase.setRefreshToken(refreshToken);
    if (newRefreshToken) {
      res.cookie(
        "refreshToken",
        newRefreshToken,
        generateRefreshTokenCookieOptions()
      );
    }
    return res
      .status(OK)
      .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
      .json({
        message: "Access token refreshed",
        accessToken,
      });
  });

  // verify email handler
  verifyEmailHandler = catchErrors(async (req: Request, res: Response) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await this.registerUserUseCase.verifyEmail(verificationCode);
    return res.status(OK).json({
      message: "Email was successfully verfied",
    });
  });


  // handler for user forgot password [user enter the email for getting the reset otp]
  sendPasswordResetHandler = catchErrors(async (req: Request, res: Response) => {
    const email = emailSchema.parse(req.body.email);
   const { user , accessToken} = await this.registerUserUseCase.sendPasswordResetEmail(email);
    (req.session as any)._id = user._id;
   setTempAuthCookies({res, accessToken})
   return res.status(OK).json({
    success : true,
    message: "Password reset email sent successfully",
   });
  });

  
  // handler for verifing the otp  and redirecting to the reset password page
  verifyResetPasswordCode = catchErrors(async (req: Request, res: Response) => {
    const userId = (req.session as any)._id;
    console.log(userId, "From rest you password otp handler")
    const {code} = otpVerificationSchema.parse(req.body);
    console.log(code , "From rest you password otp handler")
    await this.registerUserUseCase.verifyResetPasswordCode(userId, code);
    return res.status(OK).json({
      success : true,
      message: "Email was successfully verfied",
    });
  })
// this handler set a new password for the user
  resetPasswordHandler = catchErrors(async (req: Request, res: Response) => {
    const token = req.cookies['accessToken'];
    const {payload , error} = verifyResetToken(token)
    if(error) return res.status(UNAUTHORIZED).json({ 
      success : false , 
      message : "Invalid or Expired Token . Try again"
    });
    const email = payload!.email
    console.log("destructuring from payload", email)
    const request = resetPasswordSchema.parse(req.body);
    console.log("Incoming request: ",request)
    await this.registerUserUseCase.resetPassword({email, ...request});

    return  clearTempAuthCookies(res).status(OK).json({
      message : "Password reset successful"
    })
  })
  // handler for resend the otp for setting new  password to the user
  resendPasswordHandler = catchErrors(async (req: Request, res: Response) => {
    const email = (req.session as any).email;
    const type = req.body
    await this.registerUserUseCase.resendVerificaitonCode(email , type);
    return res.status(OK).json({
      message: "Password reset email sent successfully",
    });
  })
  //auth check 
  checkAuthHandler = catchErrors(async (req: Request, res: Response) => {
    console.log("check auth handler called")
    res.status(OK).json({
      message: "Authenticated",
    });
  });


}
