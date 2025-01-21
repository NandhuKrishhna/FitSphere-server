import mongoose, { Model, Schema } from "mongoose";


export interface IUserOtp extends Document{
    _id : string;
    email : string;
    otp : string;
    createdAt : Date;
    updatedAt : Date;
    exprieAt : Date
}


const UserOtpSchema = new Schema<IUserOtp>({
    email : {
        type : String,
        required : true,
    },
    otp : {
        type : String,
        required : true,
    },
    exprieAt : {
        type : Date,
        required : true,
        expires : 10 * 60
    },
}, { timestamps: true });

export const UserOtpModel : Model<IUserOtp> = mongoose.model<IUserOtp>("UserOtp", UserOtpSchema);
