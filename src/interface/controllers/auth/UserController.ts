import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import Container, { Inject, Service } from "typedi";
import { CREATED, OK, UNAUTHORIZED } from "../../../shared/constants/http";
import { RegisterUserUseCase } from "../../../application/user-casers/RegisterUserUseCase";
import {
  emailSchema,
  loginSchema,
  resetPasswordSchema,
  userRegisterSchema,
  verificationCodeSchema,
} from "../../validations/userSchema";
import {
  clearAuthCookies,
  generateRefreshTokenCookieOptions,
  getAccessTokenCookieOptions,
  setAuthCookies,
} from "../../../shared/utils/setAuthCookies";
import { verfiyToken } from "../../../shared/utils/jwt";
import appAssert from "../../../shared/utils/appAssert";
import { clear } from "console";

@Service()
export class UserController {
  constructor(@Inject() private registerUserUseCase: RegisterUserUseCase) {}
  //  user register handler
  registerHandler = catchErrors(async (req: Request, res: Response) => {
    const request = userRegisterSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { user, accessToken, refreshToken , code } =
      await this.registerUserUseCase.registerUser(request);

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json({user, code});
  });

  // user login handler
  loginHandler = catchErrors(async (req: Request, res: Response) => {
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { accessToken, refreshToken, user } =
      await this.registerUserUseCase.loginUser(request);
    return setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
      message: "Login successful",
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
   const response = await this.registerUserUseCase.sendPasswordResetEmail(email);
   return res.status(OK).json({
    message: "Password reset email sent successfully",
   });
    
  });


  resetPasswordHandler = catchErrors(async (req: Request, res: Response) => {
    const request = resetPasswordSchema.parse(req.body);
    console.log("Incoming request: ",request)
    await this.registerUserUseCase.resetPassword(request);
    return  clearAuthCookies(res).status(OK).json({
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
