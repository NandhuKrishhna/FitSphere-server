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
import { oauth2Client } from "../../../infrastructure/config/googleAuth";

@Service()
export class UserController {
  constructor(@Inject() private registerUserUseCase: RegisterUserUseCase) { }

  registerHandler = catchErrors(async (req: Request, res: Response) => {
    const request = userRegisterSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { user, accessToken, refreshToken } = await this.registerUserUseCase.registerUser(request);
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json({
        success: true,
        message: `Registration successfull. An OTP has been sent to ${user.email}`,
        response: { ...user, accessToken },
      });
  });
  // verfiy Otp;
  otpVerifyHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = stringToObjectId(req.body.userId);
    const { code } = otpVerificationSchema.parse(req.body);
    await this.registerUserUseCase.verifyOtp(code, userId);
    return res.status(OK).json({
      success: true,
      message: "Email was successfully verfied",
    });
  });

  // user login handler
  loginHandler = catchErrors(async (req: Request, res: Response) => {
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { accessToken, refreshToken, user } = await this.registerUserUseCase.loginUser(request);
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({
        message: "Login successful",
        response: { ...user, accessToken },
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
    console.log("Refreshing token...", req.cookies.refreshToken);
    const refreshToken = req.cookies.refreshToken as string | undefined;
    appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token, please log in again");
    const { accessToken, newRefreshToken } = await this.registerUserUseCase.setRefreshToken(refreshToken);
    if (newRefreshToken) {
      res.cookie("refreshToken", newRefreshToken, generateRefreshTokenCookieOptions());
    }
    return res.status(OK).cookie("accessToken", accessToken, getAccessTokenCookieOptions()).json({
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
    const role = req.body.role;
    const email = emailSchema.parse(req.body?.data?.email);
    const { user } = await this.registerUserUseCase.sendPasswordResetEmail(email, role);
    return res.status(OK).json({
      success: true,
      message: "Password reset email sent successfully",
      email: user.email,
      userId: user._id,
    });
  });

  // handler for verifing the otp  and redirecting to the reset password page
  verifyResetPasswordCode = catchErrors(async (req: Request, res: Response) => {
    const userId = stringToObjectId(req.body.userId);
    const { code } = otpVerificationSchema.parse(req.body);
    await this.registerUserUseCase.verifyResetPassword(userId, code);
    return res.status(OK).json({
      success: true,
      message: "Email was successfully verfied",
    });
  });
  // this handler set a new password for the user
  resetPasswordHandler = catchErrors(async (req: Request, res: Response) => {
    const role = req.body.role;
    const userId = stringToObjectId(req.body.userId);
    const request = resetPasswordSchema.parse(req.body);
    await this.registerUserUseCase.resetPassword({ userId, role, ...request });

    return clearTempAuthCookies(res).status(OK).json({
      message: "Password reset successful",
    });
  });
  // handler for resend the otp for setting new password to the user
  resendPasswordHandler = catchErrors(async (req: Request, res: Response) => {
    const role = req.body.role;
    const email = emailSchema.parse(req.body.email);
    const { user } = await this.registerUserUseCase.resendVerificaitonCode(email, role);
    return res.status(OK).json({
      message: `Verification code sent to ${user.email}`,
    });
  });


  googleAuthHandler = catchErrors(async (req: Request, res: Response) => {
    const code = req.query.code;
    if (typeof code !== 'string') {
      throw new Error('Invalid code query parameter');
    }
    const { accessToken, refreshToken, user } = await this.registerUserUseCase.googleAuth(code);
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({
        message: "Google login successful",
        response: { ...user, accessToken },
      });
  });

}
