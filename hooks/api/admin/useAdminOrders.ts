import { apiClient } from "@/lib/apiClient";
import { buildQueryString } from "@/lib/buildQueryString";
import { PaginationMeta } from "@/lib/query-helpers";
import {
  OrderType,
  UpdateOrderPayLoad,
  UpdateOrderResponse,
} from "@/types/OrderTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProductResponse {
  data: OrderType[];
  pagination: PaginationMeta;
}

export const useAdminOrders = (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  productType?: string;
}) => {
  return useQuery<ProductResponse, Error>({
    queryKey: ["orders", params],
    queryFn: () => apiClient.get(`/admin/orders/${buildQueryString(params)}`),
    staleTime: 30000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch a single order by ID
 */

export const useAdminOrder = (id: string) => {
  return useQuery<OrderType, Error>({
    queryKey: ["orders", id],
    queryFn: () => apiClient.get(`/admin/orders/${id}`),
    staleTime: 30000,
    enabled: !!id,
  });
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
