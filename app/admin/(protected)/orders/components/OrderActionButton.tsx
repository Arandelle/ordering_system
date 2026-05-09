/**
 * OrderActionButton.tsx
 *
 * Button to transition order to next status
 * Uses ORDER_ACTION_CONFIG for UI styling and labels
 * Uses STATUS_TRANSITIONS to validate the transition
 */

"use client";

import { useUpdateOrder } from "@/hooks/api/useOrders";
import {
  getActionConfig,
  OrderStatus,
  STATUS_TRANSITIONS,
} from "@/types/orderConstants";

interface Props {
  orderId: string;
  status: OrderStatus;
  paymentMethod: "cod" | "maya";
}

export function OrderActionButton({ orderId, status, paymentMethod }: Props) {
  const nextStatuses = STATUS_TRANSITIONS[status];

  const { mutate, isPending } = useUpdateOrder();

  // Don't show button if no transition or no config
  if (!nextStatuses || nextStatuses.length === 0) return null;

  const handleClick = (nextStatus: OrderStatus) => {
    mutate({
      id: orderId,
      data: { status: nextStatus },
    });
  };

  // OrderActionButton.tsx
  return (
    <div className="flex gap-2">
      {nextStatuses.map((nextStatus) => {
        const actionConfig = getActionConfig(nextStatus, paymentMethod);

        if (!actionConfig) return;
        return (
          <button
            key={nextStatus}
            onClick={() => handleClick(nextStatus)}
            disabled={isPending}
            className={`text-xs rounded-full font-bold text-white py-2 px-4 cursor-pointer text-nowrap ${actionConfig.variant}`}
          >
            {isPending ? "Updating..." : actionConfig.label}
          </button>
        );
      })}
    </div>
  );
}
