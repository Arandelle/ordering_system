import { OrderType } from "@/types/OrderTypes";

// utils/orderActions.ts
export type OrderStatus = OrderType["status"];

// utils/orderActions.ts
const VARIANT_STYLES = {
  accept:   "bg-[#e13e00] hover:bg-[#c13500]",
  ready: "bg-green-700 hover:bg-green-800",
  dispatched:  "bg-orange-500 hover:bg-orange-600",
  complete:    "bg-amber-500 hover:bg-amber-600",
};

export const ORDER_TRANSITIONS: Record<
  OrderStatus,
  {
    label: string;
    nextStatus: OrderStatus;
    variant: string;
  } | null
> = {
  pending: null, // waiting for payment, staff does nothing
  paid: {
    label: "Accept Order",
    nextStatus: "preparing",
    variant: VARIANT_STYLES["accept"],
  },
  preparing: {
    label: "Mark as Ready",
    nextStatus: "ready",
    variant: VARIANT_STYLES["ready"],
  },
  ready: {
    label: "Dispatch",
    nextStatus: "dispatched",
    variant: VARIANT_STYLES["dispatched"],
  },
  dispatched: {
    label: "Mark Completed",
    nextStatus: "completed",
    variant: VARIANT_STYLES["complete"],
  },
  completed: null,
  cancelled: null,
};
