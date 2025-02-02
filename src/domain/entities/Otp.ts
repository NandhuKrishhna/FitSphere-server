import mongoose from "mongoose";



export class Otp {
    constructor(
        public _id : mongoose.Types.ObjectId,
        public userId: mongoose.Types.ObjectId,
        public code : string,
        public type: string,
        public expiresAt: Date,
        public createdAt? : Date,

    ){}
}