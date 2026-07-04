import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import {
  ReviewListResponse,
  AdminReplyPayload,
  AdminReplyResponse,
  ToggleVisibilityResponse,
} from "@/types/ReviewTypes";
import { buildQueryString } from "@/utils/buildQueryString";

// ── Query keys ────────────────────────────────────────────────────────────
const reviewKeys = {
  all: ["reviews", "admin"] as const,
  list: (params?: Record<string, any>) =>
    [...reviewKeys.all, "list", params] as const,
};

// ── GET: list all reviews ──────────────────────────────────────────────────
export const useAdminReviews = (params?: Record<string, any>) => {
  return useQuery<ReviewListResponse, Error>({
    queryKey: reviewKeys.list(params),
    queryFn: () =>
      apiClient.get<ReviewListResponse>(
        `/admin/reviews${buildQueryString(params)}`,
      ),
    staleTime: 30_000,
    retry: 1,
  });
};

// ── PATCH: admin reply to a review ─────────────────────────────────────────
export const useAdminReviewReply = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminReplyResponse, Error, { id: string; payload: AdminReplyPayload }>({
    mutationFn: ({ id, payload }) =>
      apiClient.patch<AdminReplyResponse>(
        `/admin/reviews/${id}`,
        { action: "reply", ...payload },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success("Reply added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add reply");
    },
  });
};

// ── PATCH: toggle review visibility ────────────────────────────────────────
export const useToggleReviewVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation<ToggleVisibilityResponse, Error, string>({
    mutationFn: (id) =>
      apiClient.patch<ToggleVisibilityResponse>(
        `/admin/reviews/${id}`,
        { action: "toggleVisibility" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success("Review visibility updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to toggle visibility");
    },
  });
};