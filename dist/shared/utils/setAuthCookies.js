"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTempAuthCookies = exports.setTempAuthCookies = exports.getTempAccessTokenCookieOptions = exports.clearAuthCookies = exports.setAuthCookies = exports.generateRefreshTokenCookieOptions = exports.getAccessTokenCookieOptions = exports.REFRESH_PATH = void 0;
const date_1 = require("./date");
const env_1 = require("../constants/env");
const secure = env_1.NODE_ENV === "production";
exports.REFRESH_PATH = "/api/auth/refresh";
const defaults = {
    httpOnly: true,
    secure: env_1.NODE_ENV === "production",
    sameSite: env_1.NODE_ENV === "production" ? "none" : "strict",
    domain: env_1.NODE_ENV === "production" ? ".nandhu.live" : undefined
};
const getAccessTokenCookieOptions = () => (Object.assign(Object.assign({}, defaults), { expires: (0, date_1.fifteenMinutesFromNow)() }));
exports.getAccessTokenCookieOptions = getAccessTokenCookieOptions;
const generateRefreshTokenCookieOptions = () => (Object.assign(Object.assign({}, defaults), { expires: (0, date_1.thirtyDaysFromNow)(), path: exports.REFRESH_PATH }));
exports.generateRefreshTokenCookieOptions = generateRefreshTokenCookieOptions;
const setAuthCookies = ({ res, accessToken, refreshToken }) => {
    return res
        .cookie("accessToken", accessToken, (0, exports.getAccessTokenCookieOptions)())
        .cookie("refreshToken", refreshToken, (0, exports.generateRefreshTokenCookieOptions)());
};
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res) => res.clearCookie("accessToken").clearCookie("refreshToken", {
    path: exports.REFRESH_PATH
});
exports.clearAuthCookies = clearAuthCookies;
const getTempAccessTokenCookieOptions = () => (Object.assign(Object.assign({}, defaults), { expires: (0, date_1.fifteenMinutesFromNow)() }));
exports.getTempAccessTokenCookieOptions = getTempAccessTokenCookieOptions;
const setTempAuthCookies = ({ res, accessToken }) => {
    return res
        .cookie("accessToken", accessToken, (0, exports.getTempAccessTokenCookieOptions)());
};
exports.setTempAuthCookies = setTempAuthCookies;
const clearTempAuthCookies = (res) => res.clearCookie("accessToken");
exports.clearTempAuthCookies = clearTempAuthCookies;
