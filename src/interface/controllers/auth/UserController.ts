import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { Inject, Service } from "typedi";
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
} from "../../../shared/utils/setAuthCookies";
import { verfiyToken } from "../../../shared/utils/jwt";
import appAssert from "../../../shared/utils/appAssert";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { IRegisterUseCaseToken } from "../../../application/user-casers/interface/IRegisterUseCase";
import { IUserController, IUserControllerToken } from "../../controllerInterface/IUserController";

@Service()

export class UserController implements IUserController {
  constructor(@Inject() private _registerUserUseCase: RegisterUserUseCase) { }


  //** @description: This method is used to register a new user.
  registerHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body)
    const request = userRegisterSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { user, accessToken, refreshToken } = await this._registerUserUseCase.registerUser(request);
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json({
        success: true,
        message: `Registration successfull. An OTP has been sent to ${user.email}`,
        response: { ...user, accessToken },
      });
  });


  //** @description: This method is used to verify the OTP sent to the user during registration.
  otpVerifyHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = stringToObjectId(req.body.userId);
    const { code } = otpVerificationSchema.parse(req.body);
    await this._registerUserUseCase.verifyOtp(code, userId);
    return res.status(OK).json({
      success: true,
      message: "Email was successfully verfied",
    });
  });

  //** @description: This method is used to login a user.
  loginHandler = catchErrors(async (req: Request, res: Response) => {
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { accessToken, refreshToken, user } = await this._registerUserUseCase.loginUser(request);
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({
        message: "Login successful",
        response: { ...user, accessToken },
      });
  });


  //** @description: This method is used to logout a user.
  logoutHandler = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    const { payload } = verfiyToken(accessToken || "");
    if (payload) {
      await this._registerUserUseCase.logoutUser(payload);
    }
    return clearAuthCookies(res).status(OK).json({
      message: "Logout successful",
    });
  });



  //** @description: This method is used to refresh the access token using the refresh token.
  refreshHandler = catchErrors(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token, please log in again");
    const { accessToken, newRefreshToken } = await this._registerUserUseCase.setRefreshToken(refreshToken);
    if (newRefreshToken) {
      res.cookie("refreshToken", newRefreshToken, generateRefreshTokenCookieOptions());
    }
    return res.status(OK).cookie("accessToken", accessToken, getAccessTokenCookieOptions()).json({
      message: "Access token refreshed",
      accessToken,
    });
  });


  //** @description: This method is used to verify the email of the user.
  verifyEmailHandler = catchErrors(async (req: Request, res: Response) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await this._registerUserUseCase.verifyEmail(verificationCode);
    return res.status(OK).json({
      message: "Email was successfully verfied",
    });
  });

  //** @description: This method is used to send a password reset email to the user.
  sendPasswordResetHandler = catchErrors(async (req: Request, res: Response) => {
    const role = req.body.role;
    const email = emailSchema.parse(req.body?.data?.email);
    const { user } = await this._registerUserUseCase.sendPasswordResetEmail(email, role);
    return res.status(OK).json({
      success: true,
      message: "Password reset email sent successfully",
      email: user.email,
      userId: user._id,
    });
  });


  //** @description: This method is used to verify the OTP sent to the user for password reset.
  verifyResetPasswordCode = catchErrors(async (req: Request, res: Response) => {
    const userId = stringToObjectId(req.body.userId);
    const { code } = otpVerificationSchema.parse(req.body);
    await this._registerUserUseCase.verifyResetPassword(userId, code);
    return res.status(OK).json({
      success: true,
      message: "Email was successfully verfied",
    });
  });


  //** @description: This method is used to reset the password of the user.
  resetPasswordHandler = catchErrors(async (req: Request, res: Response) => {
    const role = req.body.role;
    const userId = stringToObjectId(req.body.userId);
    const request = resetPasswordSchema.parse(req.body);
    await this._registerUserUseCase.resetPassword({ userId, role, ...request });

    return clearTempAuthCookies(res).status(OK).json({
      message: "Password reset successful",
    });
  });


  //** @description: This method is used to resend the verification code to the user.
  resendPasswordHandler = catchErrors(async (req: Request, res: Response) => {
    const role = req.body.role;
    const email = emailSchema.parse(req.body.email);
    const { user } = await this._registerUserUseCase.resendVerificaitonCode(email, role);
    return res.status(OK).json({
      message: `Verification code sent to ${user.email}`,
    });
  });



  //** @description: This method is used to verify the Google login.
  googleAuthHandler = catchErrors(async (req: Request, res: Response) => {
    const code = req.query.code;
    if (typeof code !== 'string') {
      throw new Error('Invalid code query parameter');
    }
    const { accessToken, refreshToken, user } = await this._registerUserUseCase.googleAuth(code);
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({
        message: "Google login successful",
        response: { ...user, accessToken },
      });
  });

}
