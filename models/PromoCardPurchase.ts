import mongoose, { model, models, Schema } from "mongoose";

export const PROMO_CARD_PURCHASE_STATUSES = [
  "pending",
  "paid",
  "failed",
  "expired",
  "cancelled",
] as const;

const PromoCardPurchaseSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    checkoutId: String,
    paymentId: String,
    status: {
      type: String,
      enum: PROMO_CARD_PURCHASE_STATUSES,
      default: "pending",
      index: true,
    },
    paymentStatus: String,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true },
    customerPhone: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    discountRate: { type: Number, required: true },
    paidAt: Date,
    failedAt: Date,
    expiredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true },
);

PromoCardPurchaseSchema.index({ status: 1, createdAt: -1 });
PromoCardPurchaseSchema.index({ customerEmail: 1, createdAt: -1 });
PromoCardPurchaseSchema.index(
  { customerId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "paid"] } },
  },
);

export const PromoCardPurchase =
  models.PromoCardPurchase ||
  model("PromoCardPurchase", PromoCardPurchaseSchema);
