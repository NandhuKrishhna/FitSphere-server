import mongoose from "mongoose";

export type RegisterUserParams ={
    name: string;
    email: string;
    password: string;
    userAgent?: string;
};

export type LoginUserParams ={
    email: string;
    password: string;
    userAgent?: string;
}


export type ResetPasswordParams = {
    email : string;
    password : string;
}