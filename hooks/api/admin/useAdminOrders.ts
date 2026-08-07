import {
  OrderParams,
  useOrderBase,
  useOrdersBase,
  useUpdateOrder,
} from "../shared/useOrdersBase";
import { apiClient } from "@/lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const userType = "admin"

export const useAdminOrders = (params?: OrderParams) => {
  return useOrdersBase(userType, params);
};

export const useAdminOrder = (id: string) => {
  return useOrderBase(userType, id);
};

/**
 * Update order status with validation
 * Uses STATUS_TRANSITIONS from constants for safety
 */

export const useAdminUpdateOrder = () => {
  return useUpdateOrder(userType);
};

/**
 * Soft-delete a terminal order (cancelled/expired/failed) older than 30 days.
 * The order is flagged as deleted and excluded from the main orders list.
 */
export const useAdminDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient.delete(`/admin/orders/${orderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order archived successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive order");
    },
  });
};

/**
 * Process a refund on a completed or cancelled order.
 * Refund is independent of order status — tracked in the refund subdocument.
 */
export const useAdminRefundOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      reason,
      notes,
      amount,
    }: {
      orderId: string;
      reason: string;
      notes?: string;
      amount?: number;
    }) =>
      apiClient.patch(`/admin/orders/${orderId}/refund`, {
        reason,
        notes,
        amount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Refund processed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process refund");
    },
  });
};
