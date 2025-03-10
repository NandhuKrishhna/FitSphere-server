import { Service } from "typedi";
import {
  ITransactionRepository,
  ITransactionRepositoryToken,
} from "../../application/repositories/ITransactionRepository";
import TransactionModel, { ITransaction } from "../models/transactionModel";

@Service(ITransactionRepositoryToken)
export class TransactionRepository implements ITransactionRepository {
  async createTransaction(transaction: ITransaction): Promise<ITransaction> {
    const newTransaction = await TransactionModel.create(transaction);
    return newTransaction;
  }

  async getTransactionById(transactionId: string): Promise<ITransaction[] | null> {
    const transaction = await TransactionModel.find({ transactionId });
    return transaction;
  }
}
