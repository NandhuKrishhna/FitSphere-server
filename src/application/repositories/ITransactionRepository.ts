import { Token } from "typedi";
import { ITransaction } from "../../infrastructure/models/transactionModel";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { TransactionsResponse } from "../../domain/types/transaction.types";
import { TransactionQueryParams } from "../../domain/types/queryParams.types";

export interface ITransactionRepository {
  createTransaction(transaction: Partial<ITransaction>): Promise<ITransaction>;
  getTransactionById(transactionId: string): Promise<ITransaction | null>;
  updateTransaction(
    query: { transactionId?: string; paymentGatewayId?: string; bookingId?: string },
    update: Partial<ITransaction>
  ): Promise<ITransaction | null>;
  getAllTransactions(userId: ObjectId): Promise<ITransaction[]>;
  fetchAllTransactionById(userId: ObjectId, queryParams: TransactionQueryParams, role: string): Promise<TransactionsResponse>
}

export const ITransactionRepositoryToken = new Token<ITransactionRepository>();
