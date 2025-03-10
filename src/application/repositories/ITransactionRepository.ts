import { Token } from "typedi";
import { ITransaction } from "../../infrastructure/models/transactionModel";

export interface ITransactionRepository {
  createTransaction(transaction: Partial<ITransaction>): Promise<ITransaction>;
  getTransactionById(transactionId: string): Promise<ITransaction[] | null>;
}

export const ITransactionRepositoryToken = new Token<ITransactionRepository>();
