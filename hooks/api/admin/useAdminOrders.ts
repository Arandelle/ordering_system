import { apiClient } from "@/lib/apiClient";
import { PaginationMeta } from "@/lib/query-helpers";
import {
  OrderType,
  UpdateOrderPayLoad,
  UpdateOrderResponse,
} from "@/types/OrderTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderParams, useOrderBase, useOrdersBase } from "../useOrdersBase";


export const useAdminOrders = (params?: OrderParams) => {
  return useOrdersBase("admin", params);
};

export const useAdminOrder = (id: string) => {
  return useOrderBase("admin", id);
};

/**
 * Update order status with validation
 * Uses STATUS_TRANSITIONS from constants for safety
 */

export const useAdminUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateOrderResponse,
    Error,
    { id: string; data: UpdateOrderPayLoad }
  >({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderPayLoad }) =>
      apiClient.patch(`/admin/orders/${id}`, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
