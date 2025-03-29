export type RazorpayParams = {
    razorpay_order_id: string,
    razorpay_payment_id?: string,
    razorpay_signature?: string
}

export interface IRazorpayPayment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    invoice_id: string | null;
    international: boolean;
    method: string;
    amount_refunded: number;
    refund_status: string | null;
    captured: boolean;
    description: string;
    card_id: string | null;
    bank: string | null;
    wallet: string | null;
    vpa: string | null;
    email: string;
    contact: string;
    fee: number;
    tax: number;
    error_code: string | null;
    error_description: string | null;
    created_at: number;
}

export interface IRazorpayPaymentsResponse {
    entity: string;
    count: number;
    items: IRazorpayPayment[];
}