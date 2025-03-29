import mongoose from "mongoose";

export type updatePasswordParams = {
    userId: mongoose.Types.ObjectId;
    currentPassword: string;
    newPassword: string;
    role: string;
};
