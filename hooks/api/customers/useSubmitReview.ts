import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { ItemReviewInput, SubmitReviewPayload, SubmitReviewResponse } from "@/types/ReviewTypes";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useSubmitReview = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation<SubmitReviewResponse, Error, SubmitReviewPayload>({
    mutationFn: (payload) =>
      apiClient.post<SubmitReviewResponse, SubmitReviewPayload>(
        `/customer/orders/${orderId}/review`,
        payload,
      ),

    onSuccess: () => {
      // Invalidate the single order so isReviewed flips to true immediately
      queryClient.invalidateQueries({ queryKey: ["orders", "customer", orderId] });
      // Also invalidate the orders list so the review badge updates
      queryClient.invalidateQueries({ queryKey: ["orders", "customer"] });
    },
  });
};