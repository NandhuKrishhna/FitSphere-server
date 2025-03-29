import mongoose from "mongoose";
import { WalletDocument } from "../../infrastructure/models/walletModel";
import { Token } from "typedi";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { WalletTransactionQuery } from "../../domain/types/queryParams.types";
export type WalletParams = {
  userId: ObjectId;
  role: string,
  amount: number;
  description?: string;
  relatedTransactionId?: string
}
export interface IWalletRepository {
  createWallet(data: Partial<WalletDocument>): Promise<WalletDocument>;

  increaseBalance(data: WalletParams): Promise<WalletDocument | null>;

  getWalletDetailsById(
    userId: ObjectId,
    role: "User" | "Doctor" | "Admin",
    queryParams: WalletTransactionQuery
  ): Promise<WalletDocument | null>;

  findWalletById(
    userId: ObjectId,
    role: "User" | "Doctor" | "Admin"
  ): Promise<WalletDocument | null>;

  decreaseBalance(data: WalletParams): Promise<WalletDocument | null>;
  addCompanyBalance(amount: number): Promise<void>;
}

export const IWalletRepositoryToken = new Token<IWalletRepository>();
