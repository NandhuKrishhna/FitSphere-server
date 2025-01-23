import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import crypto from 'crypto';
type generateAccessTokenParams = {
    userId: mongoose.Types.ObjectId;
    sessionId: mongoose.Types.ObjectId;
};



export const generateAccessToken = ({ userId, sessionId }: generateAccessTokenParams): string => {
  return jwt.sign(
    { 
      userId: userId.toString(), 
      sessionId: sessionId.toString() 
    },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );
};


export const  generateRefreshToken = ({ sessionId }: { sessionId: mongoose.Types.ObjectId }): string => {
  return jwt.sign(
    { sessionId: sessionId.toString() },
    JWT_REFRESH_SECRET,
    {
      audience: ["user"],
      expiresIn: "30d",
    }
  );
}