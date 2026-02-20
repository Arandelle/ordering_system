import { OrderType } from "@/types/OrderTypes";
import React from "react";

interface StatusBadgeProps {
  status: OrderType["status"];
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles: Record<OrderType["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    preparing: "bg-blue-100 text-blue-800 border-blue-200",
    dispatched: "bg-purple-100 text-purple-800 border-purple-200",
    ready: "bg-orange-100 text-orange-800 border-orange-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]} uppercase tracking-wide`}
    >
      {status}
    </span>
  );
}
