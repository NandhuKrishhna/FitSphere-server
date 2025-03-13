import mongoose from "mongoose";
import { IWalletRepository, IWalletRepositoryToken, WalletParams } from "../../application/repositories/IWalletRepository";
import { WalletDocument, WalletModel } from "../models/walletModel";
import { Service } from "typedi";
import { ObjectId } from "../models/UserModel";
import { WalletTransactionModel } from "../models/walletTransaction.model";

@Service(IWalletRepositoryToken)
class WalletRepository implements IWalletRepository {
  async createWallet(data: Partial<WalletDocument>): Promise<WalletDocument> {
    return await WalletModel.create(data);
  }
  async increaseBalance(data: WalletParams): Promise<WalletDocument | null> {
    try {
        console.log("🔹 increaseBalance called with data:", data);

        // Find the wallet
        const wallet = await WalletModel.findOne({
            userId: data.userId,
            role: data.role,
        });

        console.log("🔹 Wallet found:", wallet);

        if (!wallet) {
            console.log("⚠️ Wallet not found for user:", data.userId);
            return null;
        }

        if (wallet.status !== "active") {
            console.log("⚠️ Wallet is not active:", wallet.status);
            return null;
        }

        // Update wallet balance
        console.log(`🔹 Current balance: ${wallet.balance}, Adding amount: ${data.amount}`);
        wallet.balance += data.amount;
        await wallet.save();
        console.log("✅ Wallet balance updated successfully. New balance:", wallet.balance);

        // Create a transaction record if necessary
        if (data.description || data.relatedTransactionId) {
            console.log("🔹 Creating wallet transaction...");
            const transaction = await WalletTransactionModel.create({
                walletId: wallet._id,
                userId: data.userId,
                role: data.role,
                type: "credit",
                amount: data.amount,
                currency: wallet.currency,
                status: "success",
                description: data.description || "Wallet credited",
                relatedTransactionId: data.relatedTransactionId,
            });
            console.log("✅ Wallet transaction created:", transaction);
        } else {
            console.log("ℹ️ No transaction created, no description or relatedTransactionId provided.");
        }

        return wallet;
    } catch (error) {
        console.error("❌ Error increasing wallet balance:", error);
        throw error;
    }
}


  async getWalletDetailsById(
    userId: mongoose.Types.ObjectId,
    data: any
  ): Promise<WalletDocument | null> {
    return await WalletModel.findOne({ userId }).exec();
  }

  async findWalletById(
    userId: ObjectId,
    role: "User" | "Doctor"
  ): Promise<WalletDocument | null> {
    return await WalletModel.findOne({ userId, role }).exec();
  }

  async decreaseBalance(data: WalletParams): Promise<WalletDocument | null> {
    try {
        console.log("🔹 decreaseBalance called with data:", data);
        const wallet = await WalletModel.findOne({
            userId: data.userId,
            role: data.role,
        });
        console.log("🔹 Wallet found:", wallet);

        if (!wallet) {
            console.log("⚠️ Wallet not found for user:", data.userId);
            return null;
        }
        if (wallet.status !== "active") {
            console.log("⚠️ Wallet is not active:", wallet.status);
            return null;
        }
        if (wallet.balance < data.amount) {
            console.log("⚠️ Insufficient balance. Current balance:", wallet.balance, "Requested amount:", data.amount);
            return null;
        }
        console.log(`🔹 Current balance: ${wallet.balance}, Deducting amount: ${data.amount}`);
        wallet.balance -= data.amount;
        await wallet.save();
        console.log("✅ Wallet balance updated successfully. New balance:", wallet.balance);
        if (data.description || data.relatedTransactionId) {
            console.log("🔹 Creating wallet transaction...");
            const transaction = await WalletTransactionModel.create({
                walletId: wallet._id,
                userId: data.userId,
                role: data.role,
                type: "debit",
                amount: data.amount,
                currency: wallet.currency,
                status: "success",
                description: data.description || "Wallet debited",
                relatedTransactionId: data.relatedTransactionId,
            });
            console.log("✅ Wallet transaction created:", transaction);
        } else {
            console.log("ℹ️ No transaction created, no description or relatedTransactionId provided.");
        }

        return wallet;
    } catch (error) {
        console.error("❌ Error decreasing wallet balance:", error);
        throw error;
    }
}

}

export default WalletRepository;
