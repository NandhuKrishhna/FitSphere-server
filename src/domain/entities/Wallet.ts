import mongoose from "mongoose";
import { Transaction } from "../../infrastructure/models/walletModel";

  export class Wallet {
    constructor(
        public _id: mongoose.Types.ObjectId,
        public userId: mongoose.Types.ObjectId,
        public balance: number,
        public currency: string,
        public status: "active" | "inactive" | "suspended" = "active",
        public transactions: Transaction[] = [],
        public createdAt?: Date,
        public updatedAt?: Date
    ){}
  }