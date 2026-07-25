/**
 * NOTIFICATION MODEL
 *
 * Stores in-app notifications for admin/staff users.
 * Each notification can be read by multiple staff members (readBy array).
 * Indexes are designed so the most common queries run in O(1):
 *   - Unread count per user
 *   - Paginated list sorted by creation date
 *   - Filter by type, priority, branch
 */

import { NOTIFICATION_TYPE } from "@/types/notification";
import { model, models, Schema } from "mongoose";

/** Single read receipt — which staff member read the notification and when */
const ReadReceiptSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const NotificationSchema = new Schema(
  {
    /**
     * Category of the notification — used for filtering and icon selection.
     * Extend by adding new values to NOTIFICATION_TYPE in types/notification.ts.
     */
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },

    /** Short, scannable heading shown in the notification list */
    title: {
      type: String,
      required: true,
    },

    /** Longer description or context for the notification */
    message: {
      type: String,
      required: true,
    },

    /** Controls visual emphasis in the UI */
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    /** What entity this notification is about (Order, Inventory, etc.) */
    refType: {
      type: String,
      enum: [
        "Order",
        "Inventory",
        "Reservation",
        "Product",
        "Staff",
        "Branch",
        "System",
      ],
      required: true,
    },

    /** The specific document this notification points to */
    refId: {
      type: Schema.Types.ObjectId,
    },

    /**
     * Which branch this notification belongs to.
     * Null means it's a global/system notification visible to all branches.
     */
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },

    /** Arbitrary structured data the UI might need (amounts, names, etc.) */
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    /**
     * Who has read this notification. Uses $addToSet for O(1) mark-as-read.
     * The multi-key index on "readBy.userId" enables fast unread-count queries.
     */
    readBy: {
      type: [ReadReceiptSchema],
      default: [],
    },
  },
  { timestamps: true },
);

// ---------------------------------------------------------------------------
// Indexes — each serves a specific query pattern
// ---------------------------------------------------------------------------

// Paginated list: most recent first
NotificationSchema.index({ createdAt: -1 });

// Filter by notification type (e.g. show only orders)
NotificationSchema.index({ type: 1, createdAt: -1 });

// Filter by priority (e.g. show only high-priority alerts)
NotificationSchema.index({ priority: 1, createdAt: -1 });

// Branch-scoped queries (admin sees only their branch)
NotificationSchema.index({ branchId: 1, createdAt: -1 });

// Unread count per user — the critical O(1) query
// Multi-key index on readBy.userId lets MongoDB answer
// "where this user is NOT in readBy" without a collection scan
NotificationSchema.index({ "readBy.userId": 1 });

// Direct lookup by referenced entity (e.g. find all notifications for an order)
NotificationSchema.index({ refType: 1, refId: 1 });

export const Notification =
  models.Notification || model("Notification", NotificationSchema);
