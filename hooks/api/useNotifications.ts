/**
 * useNotifications hook
 *
 * Wraps the admin notification API with React Query.
 * Provides queries for listing and unread count, plus mutations for marking read.
 * The unread count polls every 30 seconds so the badge stays current.
 */

import { apiClient } from "@/lib/apiClient";
import { buildQueryString } from "@/utils/buildQueryString";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationListResponse, NotificationType } from "@/types/notification";

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

export type NotificationParams = {
  page?: number;
  limit?: number;
  type?: NotificationType;
  branchId?: string;
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const NOTIFICATIONS_KEY = "admin-notifications";
const UNREAD_COUNT_KEY = "admin-notifications-unread";

export function useNotifications(params?: NotificationParams) {
  return useInfiniteQuery<NotificationListResponse, Error>({
    queryKey: [NOTIFICATIONS_KEY, params],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get(
        `/admin/notifications${buildQueryString({ ...params, page: pageParam })}`,
      ),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 10_000,
    retry: false,
    refetchOnWindowFocus: true,
  });
}

export function useUnreadCount(branchId?: string) {
  return useQuery<{ unreadCount: number }, Error>({
    queryKey: [UNREAD_COUNT_KEY, branchId],
    queryFn: () =>
      apiClient.get(`/admin/notifications/unread-count${buildQueryString({ branchId })}`),
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: false,
    refetchOnWindowFocus: true,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiClient.patch(`/admin/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchId?: string) =>
      apiClient.patch(`/admin/notifications/read-all${buildQueryString({ branchId })}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    },
  });
}
