import mongoose from "mongoose";

export type TokenPayload = {
    sessionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
};