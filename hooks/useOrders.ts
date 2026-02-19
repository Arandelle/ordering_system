import {
  CreateOrderPayload,
  CreateOrderResponse,
  OrderType,
} from "@/types/OrderTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOrders = () => {
  return useQuery<OrderType[]>({
    // unique query
    queryKey: ["orders"],

    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      return response.json();
    },

    staleTime: 30000,
  });
};

// ============================================
// MUTATIONS (CREATE/UPDATE/DELETE data)
// ============================================

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  /*
  * Returns → CreateOrderResponse
  * Throws → Error
  * Accepts → CreateOrderPayload
  */
  return useMutation<CreateOrderResponse, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const response = await fetch("/api/paymongo/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      return data;
    },

    onSuccess: () => {
      // Refresh orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
