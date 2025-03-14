import { Service } from "typedi";
import {
  ITransactionRepository,
  ITransactionRepositoryToken,
} from "../../application/repositories/ITransactionRepository";
import TransactionModel, { ITransaction } from "../models/transactionModel";
import { ObjectId } from "../models/UserModel";

@Service(ITransactionRepositoryToken)
export class TransactionRepository implements ITransactionRepository {
  async createTransaction(transaction: Partial<ITransaction>): Promise<ITransaction> {
    const newTransaction = await TransactionModel.create(transaction);
    return newTransaction;
  }

  async getTransactionById(transactionId: string): Promise<ITransaction | null> {
    const transaction = await TransactionModel.findOne({ transactionId }).exec();
    return transaction;
  }

  async updateTransaction(
    query: { transactionId?: string; paymentGatewayId?: string; bookingId?: string },
    update: Partial<ITransaction>
  ): Promise<ITransaction | null> {
    const updatedTransaction = await TransactionModel.findOneAndUpdate(query, { $set: update }, { new: true }).exec();
    return updatedTransaction;
  }
  async getAllTransactions(userId: ObjectId): Promise<ITransaction[]> {
    const transactions = await TransactionModel.find({
      $or: [{ from: userId }, { to: userId }]
    }).exec();
    
    return transactions;
  }
  
}
