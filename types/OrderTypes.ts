import { DeliveryInfo } from "@/app/checkout/DeliveryStep";
import { CartItem } from "./MenuTypes";

export interface OrderType {
    id: string;
    createdAt: string;
    status: 'pending' | 'paid' | 'preparing' | 'dispatched' | 'ready' | 'completed' | 'cancelled';

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