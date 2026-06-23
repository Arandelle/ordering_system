/**
 * ACTIVITY LOG SCHEMA
 *
 * Centralized audit trail for all meaningful actions performed by
 * customers, staff, admins, and system events (webhooks, cron jobs).
 *
 * Both customers and staff can query their own logs; admins can query
 * all logs filtered by actor type, branch, or action category.
 */

import { model, models, Schema, Types } from "mongoose";

/**
 * Who performed the action. An activity log entry always has exactly
 * one actorType — the corresponding reference field is populated.
 */
const ActorSchema = new Schema(
  {
    /** "customer" | "staff" | "system" | "webhook" */
    actorType: {
      type: String,
      enum: ["customer", "staff", "system", "webhook"],
      required: true,
    },
    /** Reference to User collection (when actorType === "customer") */
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    /** Reference to Staff collection (when actorType === "staff") */
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },
  },
  { _id: false },
);

/**
 * What entity was affected by the action.
 */
const TargetSchema = new Schema(
  {
    /** e.g. "Order", "Inventory", "Voucher", "PromoCard" */
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    /** Human-readable label captured at event time (e.g. order ref number) */
    label: String,
  },
  { _id: false },
);

const ActivityLogSchema = new Schema(
  {
    /** Which branch this action relates to (populated when available) */
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      index: true,
    },

    /** Who performed the action */
    actor: {
      type: ActorSchema,
      required: true,
    },

    /** What was affected */
    target: {
      type: TargetSchema,
      required: true,
      index: true,
    },

    /**
     * Action category — broad grouping for filtering.
     * Examples: "order", "payment", "inventory", "voucher", "auth"
     */
    category: {
      type: String,
      required: true,
      index: true,
    },

    /**
     * Specific action taken.
     * Examples: "order.created", "order.accepted", "order.cancelled",
     *           "payment.confirmed", "payment.failed", "inventory.reserved",
     *           "voucher.issued", "voucher.refunded"
     */
    action: {
      type: String,
      required: true,
      index: true,
    },

    /** Human-readable summary of the action (shown in activity feeds) */
    summary: {
      type: String,
      required: true,
    },

    /**
     * Structured metadata — varies per action type.
     * For order status changes: { from: "pending", to: "preparing" }
     * For payments: { paymentMethod: "maya", paymentStatus: "PAYMENT_SUCCESS" }
     * For inventory: { productId, quantity, branchId }
     */
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    /**
     * IP address of the actor when available (useful for staff audit trails)
     */
    ipAddress: String,
  },
  { timestamps: true },
);

// Indexes for common query patterns
ActivityLogSchema.index({ "actor.actorType": 1, createdAt: -1 });
ActivityLogSchema.index({ "actor.customerId": 1, createdAt: -1 });
ActivityLogSchema.index({ "actor.staffId": 1, createdAt: -1 });
ActivityLogSchema.index({ category: 1, action: 1, createdAt: -1 });
ActivityLogSchema.index({ branchId: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog =
  models.ActivityLog || model("ActivityLog", ActivityLogSchema);
