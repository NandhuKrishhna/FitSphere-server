import mongoose from "mongoose";
import { Wallet, WalletDocument } from "../../infrastructure/models/walletModel";
import { Token } from "typedi";
import { ObjectId } from "../../infrastructure/models/UserModel";

export interface IWalletRepository {
  createWallet(data: Wallet): Promise<Wallet>;
  increaseBalance(userId: mongoose.Types.ObjectId, amount: number): Promise<Wallet | null>;
  addTransaction(userId: mongoose.Types.ObjectId, data: any): Promise<Wallet | null>;
  getWalletDetailsById(userId: mongoose.Types.ObjectId, data: any): Promise<Wallet | null>;
  findWalletById(userId: ObjectId): Promise<WalletDocument | null>;
  decreaseBalance(userId: mongoose.Types.ObjectId, amount: number): Promise<Wallet | null>;
}

export const IWalletRepositoryToken = new Token<IWalletRepository>();
