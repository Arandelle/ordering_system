/**
 * NOTIFICATION TYPES
 *
 * Defines the notification categories, priorities, and shapes used
 * across the notification system. Designed to be extended by adding
 * new values to the const objects.
 */

import { PaginationMeta } from "@/utils/query-helpers";

// ---------------------------------------------------------------------------
// Notification type — what the notification is about
// ---------------------------------------------------------------------------

export const NOTIFICATION_TYPE = {
  ORDER: "order",
  RESERVATION: "reservation",
  LOW_STOCK: "low_stock",
  SYSTEM: "system",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

// ---------------------------------------------------------------------------
// Priority — controls visual emphasis
// ---------------------------------------------------------------------------

export const NOTIFICATION_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
} as const;

export type NotificationPriority =
  (typeof NOTIFICATION_PRIORITY)[keyof typeof NOTIFICATION_PRIORITY];

// ---------------------------------------------------------------------------
// Reference entity types — what the notification links to
// ---------------------------------------------------------------------------

export type NotificationRefType =
  | "Order"
  | "Inventory"
  | "Reservation"
  | "Product"
  | "Staff"
  | "Branch"
  | "System";

// ---------------------------------------------------------------------------
// Frontend shapes
// ---------------------------------------------------------------------------

export interface NotificationItem {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  refType: NotificationRefType;
  refId?: string;
  branchId?: string;
  branchName?: string;
  metadata?: Record<string, unknown>;
  readBy: { userId: string; readAt: string }[];
  isRead?: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  pagination: PaginationMeta,
  unreadCount: number;
}
