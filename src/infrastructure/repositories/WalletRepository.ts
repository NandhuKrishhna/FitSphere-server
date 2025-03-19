import mongoose from "mongoose";
import { IWalletRepository, IWalletRepositoryToken, WalletParams } from "../../application/repositories/IWalletRepository";
import { WalletDocument, WalletModel } from "../models/walletModel";
import { Service } from "typedi";
import { ObjectId } from "../models/UserModel";
import { WalletTransactionModel } from "../models/walletTransaction.model";
import { WalletTransactionQuery } from "../../interface/controllers/Feat/AppController";

@Service(IWalletRepositoryToken)
class WalletRepository implements IWalletRepository {
  async createWallet(data: Partial<WalletDocument>): Promise<WalletDocument> {
    return await WalletModel.create(data);
  }
  async increaseBalance(data: WalletParams): Promise<WalletDocument | null> {
    try {
        console.log("🔹 increaseBalance called with data:", data);
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

        console.log(` Current balance: ${wallet.balance}, Adding amount: ${data.amount}`);
        wallet.balance += data.amount;
        await wallet.save();
        console.log(" Wallet balance updated successfully. New balance:", wallet.balance);
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
  userId: ObjectId,
  role: "User" | "Doctor",
  query: WalletTransactionQuery
): Promise<any> {
  const { page = "1", limit = "5", sortBy = "createdAt", sortOrder = "desc", search, status, description } = query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const matchStage: any = { userId, role };
  const transactionMatch: any = {};
  if (search) {
    transactionMatch.$or = [
      { description: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
    ];
  }
  if (status) transactionMatch.status = status;
  if (description) transactionMatch.description = { $regex: description, $options: "i" };
  const walletExists = await WalletModel.findOne({ userId, role });
  
  if (!walletExists) {
    return {
      wallet: null,
      transactions: [],
      page: pageNum,
      limit: limitNum,
      total: 0,
      totalPages: 0,
    };
  }
  const totalTransactions = await WalletTransactionModel.countDocuments({
    walletId: walletExists._id, 
    ...(search && {
      $or: [
        { description: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ],
    }),
    ...(status && { status }),
    ...(description && { description: { $regex: description, $options: "i" } }),
  });
  
  const walletDetails = await WalletModel.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "wallettransactions",
        localField: "_id",
        foreignField: "walletId", 
        as: "transactions",
        pipeline: [
          { $match: transactionMatch },
          { $sort: { [sortBy]: sortDirection } },
          { $skip: (pageNum - 1) * limitNum },
          { $limit: limitNum },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        role: 1,
        balance: 1,
        currency: 1,
        status: 1,
        transactions: 1,
      },
    },
  ]).exec();

  const totalPages = Math.ceil(totalTransactions / limitNum) || 0;

  return {
    wallet: walletDetails.length > 0
      ? {
          balance: walletDetails[0].balance,
          currency: walletDetails[0].currency,
          status: walletDetails[0].status,
        }
      : null,
    transactions: walletDetails.length > 0 ? walletDetails[0].transactions : [],
    page: pageNum,
    limit: limitNum,
    total: totalTransactions,
    totalPages: totalPages,
  };
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
