"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type NotificationParams,
} from "@/hooks/api/useNotifications";
import { NotificationItem, NotificationType } from "@/types/notification";
import { useAdminBranchContext } from "@/contexts/AdminBranchContext";
import { useStaffContext } from "@/contexts/StaffContext";
import { STAFF_ROLES } from "@/types/staff";
import { SelectField } from "../ui/FormComponents";
import { IconButton } from "../ui/buttons";
import { FetchError } from "../ui/FetchError";
import { groupByDate } from "@/helper/formatter";
import { getNotificationRoute } from "@/lib/notificationRoute";

// ---------------------------------------------------------------------------
// Tab filter options
// ---------------------------------------------------------------------------

const FILTER_TABS: { label: string; value: NotificationType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Orders", value: "order" },
  { label: "Stock", value: "low_stock" },
  { label: "Reservations", value: "reservation" },
  { label: "System", value: "system" },
];

// ---------------------------------------------------------------------------
// Icon mapping per notification type
// ---------------------------------------------------------------------------

const TYPE_ICON: Record<NotificationType, string> = {
  order: "ShoppingBag",
  reservation: "CalendarCheck",
  low_stock: "PackageX",
  system: "Settings",
};

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-400",
  normal: "bg-slate-300",
  low: "bg-slate-200",
};

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationType | "all">(
    "all",
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const staff = useStaffContext();
  const { selectedBranchId } = useAdminBranchContext();

  // Admin role: server uses staff.branch (no selector shown).
  // Superadmin/cashier: use the branch selector context ("all" = no filter).
  const branchId =
    staff.role === STAFF_ROLES.ADMIN
      ? undefined
      : selectedBranchId === "all"
        ? undefined
        : selectedBranchId;

  const params: NotificationParams = {
    limit: 20,
    type: activeFilter === "all" ? undefined : activeFilter,
    branchId,
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useNotifications(params, open);
  const { data: unreadData } = useUnreadCount(branchId);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = unreadData?.unreadCount ?? 0;

  // Flatten notifications from all fetched pages
  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.notifications) ?? [],
    [data],
  );

  // Group by date for section headers
  const dateGroups = useMemo(
    () => groupByDate(notifications, (n) => n.createdAt),
    [notifications],
  );

  const totalNotifications = data?.pages[0]?.pagination.total ?? 0;

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleClickNotification = (notification: NotificationItem) => {
    // Mark as read if unread
    if (!notification.isRead && !markRead.isPending) {
      markRead.mutate(notification._id);
    }

    // Navigate to the related entity page
    const route = getNotificationRoute(
      notification.refType,
      notification.refId,
    );
    if (route) {
      setOpen(false);
      router.push(route);
    }
  };

  const handleMarkAllRead = () => {
    if (!markAllRead.isPending) {
      markAllRead.mutate(branchId);
    }
  };

  const handleSeeMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <IconButton
        onClick={() => setOpen(!open)}
        variant="secondary"
        className="rounded-xl"
        icon={{ name: "Bell", size: 20 }}
        aria-label="Notifications"
        title="View Notifications"
      />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-130 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Header */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <IconButton
                  onClick={handleMarkAllRead}
                  disabled={markAllRead.isPending}
                  text={markAllRead.isPending ? "Marking..." : "Mark all read"}
                  variant="ghost"
                  className="text-xs"
                />
              )}
            </div>

            {/* Filter select */}
            <SelectField
              value={activeFilter}
              onChange={(e) =>
                setActiveFilter((e.target.value as NotificationType) || "all")
              }
              options={FILTER_TABS.map((tab) => ({
                label: tab.label,
                value: tab.value,
              }))}
              className="text-xs my-2"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <DynamicIcon
                  name="Loader2"
                  size={20}
                  className="animate-spin text-slate-400"
                />
              </div>
            )}

            {!isLoading && isError && (
              <FetchError
                error={error ?? { error: { message: "Something went wrong" } }}
                title="Failed to load notifications"
                onRetry={refetch}
              />
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-5">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <DynamicIcon
                    name="BellOff"
                    size={20}
                    className="text-slate-300"
                  />
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  No notifications
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  You&apos;re all caught up
                </p>
              </div>
            )}

            {!isLoading &&
              dateGroups.map((group) => (
                <div key={group.label}>
                  {/* Date group header */}
                  <div className="sticky top-0 z-10 px-5 py-1.5 bg-slate-50/90 backdrop-blur-sm border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      {group.label}
                    </p>
                  </div>

                  {group.items.map((notification) => (
                    <NotificationRow
                      key={notification._id}
                      notification={notification}
                      onClick={handleClickNotification}
                    />
                  ))}
                </div>
              ))}

            {/* See more button */}
            {hasNextPage && (
              <div className="px-5 py-3 border-t border-slate-100">
                <IconButton
                  onClick={handleSeeMore}
                  disabled={isFetchingNextPage}
                  text={isFetchingNextPage ? "Loading..." : "See more"}
                  variant="underline"
                  className="text-center w-full text-xs font-extralight"
                />
              </div>
            )}

            {/* Footer count */}
            {!hasNextPage && notifications.length > 0 && (
              <div className="px-5 py-2.5 border-t border-slate-100">
                <p className="text-[11px] text-slate-300 text-center">
                  Showing all {totalNotifications} notification
                  {totalNotifications !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single notification row
// ---------------------------------------------------------------------------

function NotificationRow({
  notification,
  onClick,
}: {
  notification: NotificationItem;
  onClick: (notification: NotificationItem) => void;
}) {
  const isRead = notification.isRead ?? notification.readBy.length > 0;
  const hasRoute = !!getNotificationRoute(
    notification.refType,
    notification.refId,
  );

  return (
    <button
      onClick={() => onClick(notification)}
      className={cn(
        "w-full flex gap-3 px-5 py-3.5 text-left transition-colors border-b border-slate-50 last:border-b-0",
        isRead ? "bg-white" : "bg-brand-color-50",
        hasRoute ? "cursor-pointer hover:bg-slate-50" : "cursor-default",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
          isRead ? "bg-slate-50" : "bg-slate-100",
        )}
      >
        <DynamicIcon
          name={TYPE_ICON[notification.type] ?? "Bell"}
          size={16}
          className={cn(isRead ? "text-slate-400" : "text-slate-600")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              "text-sm leading-snug flex-1",
              isRead
                ? "text-slate-500 font-normal"
                : "text-slate-800 font-medium",
            )}
          >
            {notification.title}
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Unread indicator */}
      {!isRead && (
        <span className="shrink-0 w-2 h-2 rounded-full bg-brand-color-500 mt-2" />
      )}
    </button>
  );
}
