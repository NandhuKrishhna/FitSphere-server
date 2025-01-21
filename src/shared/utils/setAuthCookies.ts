import {  Response } from "express";
import { CookieOptions } from "express"
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";
const secure = process.env.NODE_ENV === "production";

const defaults: CookieOptions ={
    sameSite: "strict",
    httpOnly: true,
    secure
}
const getAccessTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires : fifteenMinutesFromNow()
})

const generateRefreshTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: thirtyDaysFromNow(),
    path: "/auth/refreshToken"
})

type Params = {
     res: Response;
     accessToken: string;
     refreshToken: string;
  };

  export const setAuthCookies = ({ res, accessToken, refreshToken }: Params): Response => {
    return res
      .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
      .cookie("refreshToken", refreshToken, generateRefreshTokenCookieOptions());
  };
  