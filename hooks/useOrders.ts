import { OrderType } from "@/types/OrderTypes";
import { useQuery } from "@tanstack/react-query";

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

    staleTime: 30000
  });
};
