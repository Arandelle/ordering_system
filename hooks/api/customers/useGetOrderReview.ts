import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { OrderReviewResponse } from "@/types/ReviewTypes";

// ── Query key ────────────────────────────────────────────────────────────
const orderReviewKeys = {
  detail: (orderId: string) => ["orderReview", orderId] as const,
};

// ── GET: review for a specific order ─────────────────────────────────────
// Fetches the review the customer left for a given order.
// Returns 404 if no review exists (handled by query's enabled flag).

export const useGetOrderReview = (orderId: string, enabled?: boolean) => {
  return useQuery<OrderReviewResponse, Error>({
    queryKey: orderReviewKeys.detail(orderId),
    queryFn: () =>
      apiClient.get<OrderReviewResponse>(
        `/customer/orders/${orderId}/review`,
      ),
    staleTime: 30_000,
    retry: 1,
    enabled: enabled ?? !!orderId,
  });
};

export { orderReviewKeys };
