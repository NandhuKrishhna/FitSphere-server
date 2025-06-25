import mongoose from "mongoose";
import { SignOptions, VerifyOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
export type UserRole = "user" | "doctor" | "admin";
export type RefreshTokenPayload = { sessionId: mongoose.Types.ObjectId, role: UserRole };
export type AccessTokenPayload = { userId: mongoose.Types.ObjectId; sessionId: mongoose.Types.ObjectId, role: UserRole };

type SignOptionsAndSecret = SignOptions & { secret: string };
const defaults: SignOptions = { audience: ["user"] };

export const accessTokenOptions: SignOptionsAndSecret = { expiresIn: "15m", secret: JWT_SECRET };
export const refreshTokenSignOptions: SignOptionsAndSecret = { expiresIn: "30d", secret: JWT_REFRESH_SECRET };
export const resetTokenOptions: SignOptionsAndSecret = { expiresIn: "10m", secret: JWT_SECRET };


export const signToken = (payload: AccessTokenPayload | RefreshTokenPayload, options?: SignOptionsAndSecret) => {
  const { secret, ...signOpts } = options || accessTokenOptions;
  return jwt.sign(payload, secret, { ...defaults, ...signOpts });
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(token: string, options?: VerifyOptions & { secret: string }) => {
  const { secret = JWT_SECRET, ...verifyOpts } = options || {};
  try {
    const payload = jwt.verify(token, secret, { ...defaults, ...verifyOpts }) as TPayload;
    return { payload };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const signResetToken = (payload: { userId: mongoose.Types.ObjectId, email: string, role: UserRole }) => {
  const { secret, ...signOtps } = resetTokenOptions;
  return jwt.sign(payload, secret, { ...defaults, ...signOtps });
};

export const verifyResetToken = (token: string) => {
  const { secret, ...verifyOpts } = resetTokenOptions;
  try {
    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...verifyOpts,
    }) as { userId: mongoose.Types.ObjectId, email: string, role: UserRole };
    return { payload };
  } catch (error: any) {
    return { error: error.message };
  }
};