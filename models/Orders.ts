import { model, models, Schema } from "mongoose";

/**
 * Embedded cart item snapshot
 */
export const OrderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

/**
 * Timeline subdocument
 */
const TimelineSchema = new Schema(
  {
    paidAt: Date,
    failedAt: Date,
    expiredAt: Date,
    preparingAt: Date,
    dispatchedAt: Date,
    readyAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "expired",
        "authorized",
        "preparing",
        "dispatched",
        "ready",
        "completed",
        "cancelled",
      ],
      default: "pending",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },

    paymentInfo: {
      checkoutId: String,
      referenceNumber: String,
      paymentId: String,
      paymentStatus: String,

      customerName: String,
      customerEmail: String,
      customerPhone: String,
    },

    total: {
      subTotal: { type: Number, required: true },
      tax: { type: Number, required: true },
      total: { type: Number, required: true },
    },

    estimatedTime: { type: String },

    timeline: TimelineSchema,

    note: String,

    isReviewed: {
      type: Boolean,
      default: false,
    },

    reviewedAt: Date,
  },
  { timestamps: true },
);

export const Order = models.Order || model("Order", OrderSchema);
