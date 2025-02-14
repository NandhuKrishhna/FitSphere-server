import mongoose from "mongoose";
import { Wallet } from "../../infrastructure/models/walletModel";
import { Token } from "typedi";

export interface IWalletRepository {
    createWallet(data : Wallet): Promise<Wallet>;
    increaseBalance(userId : mongoose.Types.ObjectId, amount : number): Promise<Wallet | null>;
    addTransaction(userId : mongoose.Types.ObjectId, data : any): Promise<Wallet | null>;
    getWalletDetailsById(userId : mongoose.Types.ObjectId, data : any): Promise<Wallet | null>;
};


export const IWalletRepositoryToken = new Token<IWalletRepository>();