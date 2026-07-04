import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import {
  ProductReviewResponse,
  HelpfulVotePayload,
  HelpfulVoteResponse,
  EditReviewPayload,
  EditReviewResponse,
} from "@/types/ReviewTypes";
import { buildQueryString } from "@/utils/buildQueryString";

// ── Query keys ────────────────────────────────────────────────────────────
const productReviewKeys = {
  all: ["reviews", "product"] as const,
  list: (productId: string, params?: Record<string, any>) =>
    [...productReviewKeys.all, productId, params] as const,
};

// ── GET: product reviews ───────────────────────────────────────────────────
export const useProductReviews = (
  productId: string,
  params?: { page?: number; limit?: number },
) => {
  return useQuery<ProductReviewResponse, Error>({
    queryKey: productReviewKeys.list(productId, params),
    queryFn: () =>
      apiClient.get<ProductReviewResponse>(
        `/customer/products/${productId}/reviews${buildQueryString(params)}`,
      ),
    staleTime: 30_000,
    retry: 1,
    enabled: !!productId,
  });
};

// ── POST: helpful vote (like/dislike) ──────────────────────────────────────
export const useHelpfulVote = () => {
  const queryClient = useQueryClient();

  return useMutation<
    HelpfulVoteResponse,
    Error,
    { reviewId: string; payload: HelpfulVotePayload }
  >({
    mutationFn: ({ reviewId, payload }) =>
      apiClient.post<HelpfulVoteResponse, HelpfulVotePayload>(
        `/customer/reviews/${reviewId}/helpful`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productReviewKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update vote");
    },
  });
};

// ── PATCH: edit own review ─────────────────────────────────────────────────
export const useEditReview = () => {
  const queryClient = useQueryClient();

  return useMutation<
    EditReviewResponse,
    Error,
    { reviewId: string; payload: EditReviewPayload }
  >({
    mutationFn: ({ reviewId, payload }) =>
      apiClient.patch<EditReviewResponse>(
        `/customer/reviews/${reviewId}`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productReviewKeys.all });
      toast.success("Review updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update review");
    },
  });
};
