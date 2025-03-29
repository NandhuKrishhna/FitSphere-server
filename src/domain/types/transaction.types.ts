export type Transaction = {
    _id: string;
    amount: number;
    type: "credit" | "debit";
    method: "wallet" | "razorpay";
    paymentType: "subscription" | "slot_booking" | "wallet_payment" | "cancel_appointment" | "refund";
    status: "success" | "failed" | "pending";
    currency: string;
    createdAt: string;
    fromDetails: {
        _id: string;
        name: string;
        email: string;
        profilePicture: string;
    };
    toDetails: {
        _id: string;
        name: string;
        email: string;
        profilePicture: string;
    };
};

export type TransactionsResponse = {
    transactions: Transaction[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};
