import { Service } from "typedi";
import {
  ITransactionRepository,
  ITransactionRepositoryToken,
} from "../../application/repositories/ITransactionRepository";
import TransactionModel, { ITransaction } from "../models/transactionModel";
import { ObjectId } from "../models/UserModel";
import mongoose, { isValidObjectId } from "mongoose";
import { TransactionsResponse } from "../../domain/types/transaction.types";
import { TransactionQueryParams } from "../../domain/types/queryParams.types";

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

  async fetchAllTransactionById(
    userId: ObjectId,
    {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      status,
      doctorName,
      method,
      type,
    }: TransactionQueryParams = {},
    role: "user" | "doctor"
  ): Promise<TransactionsResponse> {

    try {

      const objectIdUserId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      const pipeline: any[] = [
        {
          $match: {
            $or: [
              ...(role === "user"
                ? [
                  { from: objectIdUserId, paymentType: { $in: ["slot_booking", "subscription", "failed"] }, type: { $in: ["debit", "failed"] } },
                  { to: objectIdUserId, paymentType: "cancel_appointment", type: "credit" },
                  { to: objectIdUserId, paymentType: "refund" }
                ]
                : []),
              ...(role === "doctor"
                ? [
                  { to: objectIdUserId, paymentType: "slot_booking", type: "credit" },
                  { from: objectIdUserId, paymentType: "cancel_appointment", type: "debit" }
                ]
                : []),
            ],
            ...(status ? { status } : {}),
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "from",
            foreignField: "_id",
            as: "fromDoctor",
            pipeline: [
              {
                $project: {
                  name: 1,
                  profilePicture: 1,
                  email: 1
                }
              }
            ]
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "from",
            foreignField: "_id",
            as: "fromUser",
            pipeline: [
              {
                $project: {
                  name: 1,
                  profilePicture: 1,
                  email: 1
                }
              }
            ]
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "to",
            foreignField: "_id",
            as: "toDoctor",
            pipeline: [
              {
                $project: {
                  name: 1,
                  profilePicture: 1,
                  email: 1
                }
              }
            ]
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "to",
            foreignField: "_id",
            as: "toUser",
            pipeline: [
              {
                $project: {
                  name: 1,
                  profilePicture: 1,
                  email: 1
                }
              }
            ]
          },
        },
        {
          $project: {
            fromDetails: {
              $cond: [
                { $eq: ["$fromModel", "Doctor"] },
                { $arrayElemAt: ["$fromDoctor", 0] },
                { $arrayElemAt: ["$fromUser", 0] },
              ],
            },
            toDetails: {
              $cond: [
                { $eq: ["$toModel", "Doctor"] },
                { $arrayElemAt: ["$toDoctor", 0] },
                { $arrayElemAt: ["$toUser", 0] },
              ],
            },
            amount: 1,
            type: 1,
            method: 1,
            status: 1,
            paymentType: 1,
            currency: 1,
            createdAt: 1,
          },
        },
      ];
      if (status) pipeline.push({ $match: { status } });
      if (method) pipeline.push({ $match: { method } });
      if (type) pipeline.push({ $match: { type } });
      if (doctorName) {
        pipeline.push({
          $match: {
            $or: [
              { "fromDetails.name": { $regex: doctorName, $options: "i" } },
              { "toDetails.name": { $regex: doctorName, $options: "i" } },
            ],
          },
        });
      }
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { "fromDetails.name": { $regex: search, $options: "i" } },
              { "toDetails.name": { $regex: search, $options: "i" } },
              { "fromDetails.email": { $regex: search, $options: "i" } },
              { "toDetails.email": { $regex: search, $options: "i" } },
            ],
          },
        });
      }
      const sortOptions: { [key: string]: 1 | -1 } = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      pipeline.push({ $sort: sortOptions });
      pipeline.push({
        $facet: {
          metadata: [
            { $count: "total" },
            { $addFields: { page: pageNum, limit: limitNum } }
          ],
          data: [
            { $skip: skip },
            { $limit: limitNum }
          ],
        },
      });
      const result = await TransactionModel.aggregate(pipeline).exec();
      if (!result || !result.length) {
        return {
          transactions: [],
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
        };
      }
      const { metadata, data } = result[0];
      const total = metadata.length > 0 ? metadata[0].total : 0;

      return {
        transactions: data,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      };
    } catch (error: any) {
      console.error('Error in fetchAllTransactionById:', error);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

}
