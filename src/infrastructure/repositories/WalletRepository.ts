import mongoose, { Types } from "mongoose";
import { IWalletRepository, IWalletRepositoryToken } from "../../application/repositories/IWalletRepository";
import { Wallet, WalletDocument, WalletModel } from "../models/walletModel";
import { Service } from "typedi";
import { ObjectId } from "../models/UserModel";

@Service(IWalletRepositoryToken)
export class WalletRepository implements IWalletRepository {
  async createWallet(wallet: Wallet): Promise<Wallet> {
    return await WalletModel.create(wallet);
  }

  async increaseBalance(userId: Types.ObjectId, amount: number): Promise<Wallet | null> {
    const response = await WalletModel.findOneAndUpdate(
      { userId: userId },
      { $inc: { balance: amount } },
      { new: true }
    );
    return response;
  }

  async addTransaction(userId: mongoose.Types.ObjectId, transaction: any): Promise<Wallet | null> {
    const wallet = await WalletModel.findOneAndUpdate(
      { userId, status: "active" },
      { $push: { transactions: transaction }, updatedAt: new Date() },
      { new: true }
    );
    return wallet;
  }

  async getWalletDetailsById(userId: mongoose.Types.ObjectId, data: any): Promise<Wallet | null> {
    const existingWallet = await WalletModel.findOne({ userId: userId });
    return existingWallet;
  }
  async findWalletById(userId: ObjectId): Promise<WalletDocument | null> {
    const wallet = await WalletModel.findOne({ userId: userId });
    return wallet;
  }
  async decreaseBalance(userId: mongoose.Types.ObjectId, amount: number): Promise<Wallet | null> {
    const response = await WalletModel.findOneAndUpdate(
      { userId: userId },
      { $inc: { balance: -amount } },
      { new: true }
    );
    return response;
  }
}
