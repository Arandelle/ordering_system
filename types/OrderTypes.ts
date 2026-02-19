import { CartItem } from "./MenuTypes";

export interface OrderType {
  _id: string;
  createdAt: string;
  status:
    | "pending"
    | "paid"
    | "preparing"
    | "dispatched"
    | "ready"
    | "completed"
    | "cancelled";

  items: CartItem[];
  paymentInfo: {
    method: "cod" | "gcash" | "card" | "qrph";
    label: string;
    paymentLinkId?: string;
    checkoutUrl?: string;
    referenceNumber?: string
  };
  totals: {
    subTotal: number;
    total: number;
  };
  estimatedTime: string;

  // Additional tracking info
  timeline?: {
    paidAt?: string;
    preparingAt?: string;
    dispatchedAt?: string;
    readyAt?: string;
    completedAt?: string;
    cancelledAt?: string;
  };
  dispatchInfo?: {
    riderId?: string;
    riderName?: string;
    riderPhone?: string;
    vehicleType?: string;
  };
  notes?: string;

  isReviewed?: boolean;
  reviewedAt?: string;
}
