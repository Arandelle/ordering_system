// components/OrderActionButton.tsx
"use client";
import { ORDER_TRANSITIONS, OrderStatus } from "@/utils/orderActions";
import { useUpdateOrder } from "@/hooks/useOrders";

interface Props {
  orderId: string;
  status: OrderStatus;
}

export function OrderActionButton({ orderId, status }: Props) {
  const transition = ORDER_TRANSITIONS[status];
  const { mutate, isPending } = useUpdateOrder();

  if (!transition) return null;

  const handleClick = () => {
    mutate({
      id: orderId,
      data: { status: transition.nextStatus },
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${transition.variant}`}
    >
      {isPending ? "Updating..." : transition.label}
    </button>
  );
}