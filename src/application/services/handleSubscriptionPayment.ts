import { Inject, Service } from "typedi";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { IPremiumSubscriptionRepository, IPremiumSubscriptionRepositoryToken } from "../repositories/IPremiumSubscription";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../../shared/constants/http";
import { IUserSubscriptionRepository, IUserSubscriptionRepositoryToken } from "../repositories/IUserSubscriptionRepository";
import { ITransactionRepository, ITransactionRepositoryToken } from "../repositories/ITransactionRepository";
import { IWalletRepository, IWalletRepositoryToken } from "../repositories/IWalletRepository";
export type SubscriptionPaymentsProps = {
    userId: ObjectId,
    subscriptionId: ObjectId,
    razorpay_order_id: string,
    orderinfo_amount: string | number,
    receiptId: string,
}

@Service()
export class SubscriptionPayment {
    constructor(
        @Inject(IPremiumSubscriptionRepositoryToken) private premiumRepository: IPremiumSubscriptionRepository,
        @Inject(IUserSubscriptionRepositoryToken) private userSubscriptionRepository: IUserSubscriptionRepository,
        @Inject(ITransactionRepositoryToken) private transactionRepository: ITransactionRepository,
        @Inject(IWalletRepositoryToken) private walletRepository: IWalletRepository

    ) { }


    async handleSubscriptionPayment({
        userId,
        subscriptionId,
        razorpay_order_id,
        orderinfo_amount,
        receiptId
    }: SubscriptionPaymentsProps) {
        const existingSubscriptionPlanDetails = await this.premiumRepository.getSubscriptionById(subscriptionId);
        appAssert(existingSubscriptionPlanDetails, NOT_FOUND, "Subscription was not found. Please try another.");
        await this.userSubscriptionRepository.deleteExistingSubscription({ userId });
        await this.userSubscriptionRepository.addSubscription({ userId, subscriptionId });
        await this.walletRepository.addCompanyBalance(Number(orderinfo_amount));


        //update transacation status;
        const updatedUserTransaction = await this.transactionRepository.updateTransaction(
            { paymentGatewayId: receiptId },
            {
                status: "success",
                paymentGatewayId: razorpay_order_id,
            }
        );
        appAssert(updatedUserTransaction, BAD_REQUEST, "Failed to update user transaction.");
        return {
            message: "Subscription added successfully."
        }


    }

}
{/*
 handleSubcription flow  
   
*/}