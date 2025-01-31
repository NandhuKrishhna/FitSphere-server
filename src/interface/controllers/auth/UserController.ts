import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import{ Inject, Service } from "typedi";
import { CREATED, OK, UNAUTHORIZED } from "../../../shared/constants/http";
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


@Service()
export class UserController {
  constructor(@Inject() private registerUserUseCase: RegisterUserUseCase) {}
  //  user register handler
  registerHandler = catchErrors(async (req: Request, res: Response) => {
    const request = userRegisterSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { user, accessToken, refreshToken  } =
      await this.registerUserUseCase.registerUser(request);

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json({user , accessToken});
  });
  // verfiy Otp;
   otpVerifyHandler = catchErrors(async(req:Request, res:Response) => {
       const {code} = otpVerificationSchema.parse(req.body);
       await this.registerUserUseCase.verifyOtp(code); 
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
        email: user.email
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
    appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");
    const { accessToken, newRefreshToken } =
      await this.registerUserUseCase.setRefreshToken(refreshToken);
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

  sendPasswordResetHandler = catchErrors(async (req: Request, res: Response) => {
    const email = emailSchema.parse(req.body.email);
   const {resetToken} = await this.registerUserUseCase.sendPasswordResetEmail(email);
   setTempAuthCookies({res, accessToken: resetToken})
   return res.status(OK).json({
    message: "Password reset email sent successfully",
    resetToken
   });
    
  });


  resetPasswordHandler = catchErrors(async (req: Request, res: Response) => {
    const token = req.cookies.accessToken 
    const {payload} = verifyResetToken(token)
    appAssert(payload, UNAUTHORIZED, "Invalid token")
    const userId = payload.userId

    const request = resetPasswordSchema.parse(req.body);

    console.log("Incoming request: ",request)

    await this.registerUserUseCase.resetPassword({userId, ...request});

    return  clearTempAuthCookies(res).status(OK).json({
      message : "Password reset successful"
    })
  })

  //auth check 
  checkAuthHandler = catchErrors(async (req: Request, res: Response) => {
    console.log("check auth handler called")
    res.status(OK).json({
      message: "Authenticated",
    });
  });
}
