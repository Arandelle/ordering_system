import { model, models, Schema } from "mongoose";


/**
 * Embedded cart item snapshot
 */
const OrderItemSchema = new Schema(
  {
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
    preparingAt: Date,
    dispatchedAt: Date,
    readyAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  { _id: false }
);

const OrderSchema = new Schema({
    status: {
        type: String,
        enum: [
            "pending",
            "paid",
            "preparing",
            "dispatched",
            "ready",
            "completed",
            "cancelled"
        ],
        default: "pending",
        required: true
    },
    items: {
        type: [OrderItemSchema],
        required: true
    },

    paymentInfo : {
        method: {
            type: String,
            enum: ["gcash", "maya", "qr"],
            required: true
        },
        label: String,
        paymentLinkId: String,
        checkoutUrl: String,
        referenceNumber: String
    },

    total: {
        subTotal: {type: Number, required: true},
        total: {type: Number, required: true}
    },

    estimatedTime: {type: String},

    timeline: TimelineSchema,

    note: String,

    isReviewed: {
        type: Boolean,
        default: false
    },

    reviewedAt: Date
}, {timestamps: true});

export const Order = models.Order || model("Order", OrderSchema)
