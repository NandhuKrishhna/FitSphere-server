import { Token } from "typedi";
import { ITransaction } from "../../infrastructure/models/transactionModel";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { TransactionQueryParams } from "../../interface/controllers/Feat/AppController";

export interface ITransactionRepository {
  createTransaction(transaction: Partial<ITransaction>): Promise<ITransaction>;
  getTransactionById(transactionId: string): Promise<ITransaction | null>;
  updateTransaction(
    query: { transactionId?: string; paymentGatewayId?: string; bookingId?: string },
    update: Partial<ITransaction>
  ): Promise<ITransaction | null>;
  getAllTransactions(userId : ObjectId): Promise<ITransaction[]>;
  fetchAllTransactionById(userId:ObjectId , queryParams:TransactionQueryParams, role:string):Promise<any>
}

export const ITransactionRepositoryToken = new Token<ITransactionRepository>();
