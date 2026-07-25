/**
 * NOTIFICATION SERVICE
 *
 * Orthogonal functions for creating, querying, and managing notifications.
 * Each function does exactly one thing and can be used independently.
 *
 * Create functions are fire-and-forget — they catch their own errors
 * so notification failures never break the primary operation.
 */

import { Types } from "mongoose";
import { Notification } from "@/models/Notification";
import {
  NotificationPriority,
  NotificationRefType,
  NotificationType,
} from "@/types/notification";
import { buildPaginationMeta } from "@/utils/query-helpers";

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  refType: NotificationRefType;
  refId?: Types.ObjectId | string;
  branchId?: Types.ObjectId | string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a new notification.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function createNotification(
  params: CreateNotificationParams,
): Promise<void> {
  try {
    await Notification.create({
      type: params.type,
      title: params.title,
      message: params.message,
      priority: params.priority ?? "normal",
      refType: params.refType,
      refId: params.refId
        ? new Types.ObjectId(String(params.refId))
        : undefined,
      branchId: params.branchId
        ? new Types.ObjectId(String(params.branchId))
        : undefined,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error("[Notification] Failed to create:", err, params);
  }
}

// ---------------------------------------------------------------------------
// Query — unread count for a single user
// ---------------------------------------------------------------------------

/**
 * Count how many notifications a user has not yet read.
 * Uses the readBy.userId index for O(1) lookup.
 */
export async function getUnreadCount(
  userId: string,
  branchId?: string,
): Promise<number> {
  const filter: Record<string, unknown> = {
    "readBy.userId": { $ne: new Types.ObjectId(userId) },
  };

  if (branchId) {
    filter.$or = [
      { branchId: new Types.ObjectId(branchId) },
      { branchId: null },
      { branchId: { $exists: false } },
    ];
  }

  return Notification.countDocuments(filter);
}

// ---------------------------------------------------------------------------
// Query — paginated list
// ---------------------------------------------------------------------------

interface ListParams {
  userId: string;
  branchId?: string;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

/**
 * Return a paginated list of notifications for a user,
 * along with whether each one has been read by them.
 */
export async function listNotifications(params: ListParams) {
  const { userId, branchId, type, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (type) {
    filter.type = type;
  }

  if (branchId) {
    filter.$or = [
      { branchId: new Types.ObjectId(branchId) },
      { branchId: null },
      { branchId: { $exists: false } },
    ];
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    getUnreadCount(userId, branchId),
  ]);

  const userObjectId = new Types.ObjectId(userId);

  const enriched = notifications.map((n) => {
    const readEntry = n.readBy?.find(
      (r: { userId: Types.ObjectId }) =>
        r.userId.toString() === userObjectId.toString(),
    );

    return {
      ...n,
      _id: n._id.toString(),
      refId: n.refId?.toString(),
      branchId: n.branchId?.toString(),
      readBy: readEntry
        ? [{ userId: readEntry.userId.toString(), readAt: readEntry.readAt }]
        : [],
      isRead: !!readEntry,
    };
  });

  return {
    notifications: enriched,
    pagination: buildPaginationMeta(total, page, limit),
    unreadCount,
  };
}

// ---------------------------------------------------------------------------
// Mark one notification as read
// ---------------------------------------------------------------------------

/**
 * Mark a single notification as read by a user.
 * Only pushes if userId is not already in readBy — idempotent.
 */
export async function markAsRead(
  notificationId: string,
  userId: string,
): Promise<void> {
  await Notification.updateOne(
    {
      _id: new Types.ObjectId(notificationId),
      "readBy.userId": { $ne: new Types.ObjectId(userId) },
    },
    {
      $push: {
        readBy: { userId: new Types.ObjectId(userId), readAt: new Date() },
      },
    },
  );
}

// ---------------------------------------------------------------------------
// Mark all as read
// ---------------------------------------------------------------------------

/**
 * Mark every unread notification as read for a given user.
 * Only touches documents where this user is not already in readBy,
 * so it's efficient and idempotent.
 */
export async function markAllAsRead(
  userId: string,
  branchId?: string,
): Promise<number> {
  const filter: Record<string, unknown> = {
    "readBy.userId": { $ne: new Types.ObjectId(userId) },
  };

  if (branchId) {
    filter.$or = [
      { branchId: new Types.ObjectId(branchId) },
      { branchId: null },
      { branchId: { $exists: false } },
    ];
  }

  const result = await Notification.updateMany(filter, {
    $push: {
      readBy: { userId: new Types.ObjectId(userId), readAt: new Date() },
    },
  });

  return result.modifiedCount;
}

// ---------------------------------------------------------------------------
// Delete old notifications (maintenance)
// ---------------------------------------------------------------------------

/**
 * Remove notifications older than a given number of days.
 * Intended for periodic cleanup via a cron job or Inngest function.
 */
export async function purgeOldNotifications(
  olderThanDays: number = 90,
): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoff },
  });

  return result.deletedCount;
}

// ---------------------------------------------------------------------------
// Convenience builders — keep call-sites clean
// ---------------------------------------------------------------------------

/** Notify staff about a new incoming order */
export function notifyNewOrder(params: {
  orderId: Types.ObjectId | string;
  branchId: Types.ObjectId | string;
  referenceNumber: string;
  customerName?: string;
  totalAmount: number;
  fulfillmentType?: string;
  paymentMethod?: string;
}) {
  const firstName = params.customerName?.split(" ")[0] ?? "Customer";

  return createNotification({
    type: "order",
    title: `New ${params.fulfillmentType ?? ""} order`.trim(),
    message: `Order #${params.referenceNumber}, ${firstName} (₱${params.totalAmount.toFixed(2)})`,
    priority: "high",
    refType: "Order",
    refId: params.orderId,
    branchId: params.branchId,
    metadata: {
      referenceNumber: params.referenceNumber,
      customerName: params.customerName,
      totalAmount: params.totalAmount,
      fulfillmentType: params.fulfillmentType,
      paymentMethod: params.paymentMethod,
    },
  });
}

/** Notify staff when an order status changes */
export function notifyOrderStatusChange(params: {
  orderId: Types.ObjectId | string;
  branchId: Types.ObjectId | string;
  referenceNumber: string;
  newStatus: string;
}) {
  return createNotification({
    type: "order",
    title: "Order status updated",
    message: `Order ${params.referenceNumber} is now "${params.newStatus}"`,
    priority: "normal",
    refType: "Order",
    refId: params.orderId,
    branchId: params.branchId,
    metadata: {
      referenceNumber: params.referenceNumber,
      status: params.newStatus,
    },
  });
}

/** Notify staff when a product's stock falls below threshold */
export function notifyLowStock(params: {
  productId: Types.ObjectId | string;
  branchId: Types.ObjectId | string;
  productName: string;
  currentStock: number;
  threshold: number;
}) {
  return createNotification({
    type: "low_stock",
    title: "Low stock alert",
    message: `${params.productName} has only ${params.currentStock} unit(s) left (threshold: ${params.threshold})`,
    priority: "high",
    refType: "Inventory",
    refId: params.productId,
    branchId: params.branchId,
    metadata: {
      productName: params.productName,
      currentStock: params.currentStock,
      threshold: params.threshold,
    },
  });
}

/** Notify staff about a new reservation */
export function notifyNewReservation(params: {
  reservationId: Types.ObjectId | string;
  branchId: Types.ObjectId | string;
  customerName: string;
  date: string;
  partySize: number;
}) {
  return createNotification({
    type: "reservation",
    title: "New reservation",
    message: `${params.customerName} booked a table for ${params.partySize} on ${params.date}`,
    priority: "normal",
    refType: "Reservation",
    refId: params.reservationId,
    branchId: params.branchId,
    metadata: {
      customerName: params.customerName,
      date: params.date,
      partySize: params.partySize,
    },
  });
}

/** Generic system notification */
export function notifySystem(params: {
  title: string;
  message: string;
  priority?: NotificationPriority;
  branchId?: Types.ObjectId | string;
  metadata?: Record<string, unknown>;
}) {
  return createNotification({
    type: "system",
    title: params.title,
    message: params.message,
    priority: params.priority ?? "normal",
    refType: "System",
    branchId: params.branchId,
    metadata: params.metadata,
  });
}
