import { Response } from "express";
import { CookieOptions } from "express"
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";
import { NODE_ENV } from "../constants/env";
const secure = NODE_ENV === "production";
export const REFRESH_PATH = "/api/auth/refresh";
const defaults: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  domain: ".nandhu.live",
  sameSite: "none",
};
export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow()
})

export const generateRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path: REFRESH_PATH
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



export const clearAuthCookies = (res: Response) =>
  res.clearCookie("accessToken").clearCookie("refreshToken", {
    path: REFRESH_PATH
  });


type TempParams = {
  res: Response,
  accessToken: string
}
export const getTempAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow()
})
export const setTempAuthCookies = ({ res, accessToken }: TempParams): Response => {
  return res
    .cookie("accessToken", accessToken, getTempAccessTokenCookieOptions())
};

export const clearTempAuthCookies = (res: Response) =>
  res.clearCookie("accessToken");