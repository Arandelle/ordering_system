import { OrderType } from "@/types/OrderTypes";

// utils/orderActions.ts
export type OrderStatus = OrderType["status"];

const VARIANT_STYLES = {
  blue: "text-blue-600 hover:bg-blue-50",
  orange: "text-orange-600 hover:bg-orange-50",
  green: "text-green-600 hover:bg-green-50",
  red: "text-red-600 hover:bg-red-50",
  purple: "text-purple-600 hover:bg-purple-50",
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
    variant: VARIANT_STYLES["blue"],
  },
  preparing: {
    label: "Mark Ready",
    nextStatus: "ready",
    variant: VARIANT_STYLES["orange"],
  },
  ready: {
    label: "Dispatch",
    nextStatus: "dispatched",
    variant: VARIANT_STYLES["purple"],
  },
  dispatched: {
    label: "Mark Completed",
    nextStatus: "completed",
    variant: VARIANT_STYLES["green"],
  },
  completed: null,
  cancelled: null,
};
