import { DeliveryInfo } from "@/app/checkout/DeliveryStep";
import { CartItem } from "./MenuTypes";
import { PaymentInfo } from "@/app/checkout/PaymentStep";

export interface OrderType {
    id: string;
    createdAt: string;
    status: 'pending' | 'paid' | 'preparing' | 'completed';

    items: CartItem[];

    deliveryInfo: DeliveryInfo;
    paymentInfo: {
        method: 'cod' | 'gcash' | 'card';
        label: string
    }
    totals: {
        subTotal: number;
        deliveryFee: number;
        total: number
    }
    estimatedTime: string;
}