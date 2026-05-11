"use client";

import { useAdminUpdateOrder } from "@/hooks/api/admin/useAdminOrders";
import {
  canTransitionTo,
  getActionConfig,
  OrderStatus,
  STATUS_TRANSITIONS,
} from "@/types/orderConstants";

interface Props {
  orderId: string;
  status: OrderStatus;
  paymentMethod: "cod" | "maya";
}

export function OrderActionButton({ orderId,paymentMethod, status }: Props) {
  const nextStatuses = STATUS_TRANSITIONS[status];
  const { mutate, isPending } = useAdminUpdateOrder();

  if (!nextStatuses?.length) return null;

  const handleClick = (nextStatus: OrderStatus) => {
    mutate({ id: orderId, data: { status: nextStatus } });
  };

  const allowedStatuses = nextStatuses.filter((nextStatus) =>
    canTransitionTo(status, nextStatus, "admin"),
  );

  return (
    <div className="flex gap-2">
      {allowedStatuses.map((nextStatus) => {
        const actionConfig = getActionConfig(status, nextStatus);

        if (!actionConfig) return null;

        if (actionConfig.roles && !actionConfig.roles.includes("admin")) {
          return null;
        }

        if (
          actionConfig.paymentMethods &&
          !actionConfig.paymentMethods.includes(paymentMethod)
        ) {
          return null;
        }

        return (
          <button
            key={nextStatus}
            onClick={() => handleClick(nextStatus)}
            disabled={isPending}
            className={`text-xs rounded-full font-bold text-white py-2 px-4 cursor-pointer text-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${actionConfig.variant}`}
          >
            {isPending ? "Updating..." : actionConfig.label}
          </button>
        );
      })}
    </div>
  );
}
