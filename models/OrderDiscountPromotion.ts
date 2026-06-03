import {
  DEFAULT_ORDER_DISCOUNT_PROMOTION,
  ORDER_DISCOUNT_DAY_MODES,
  ORDER_DISCOUNT_DAYS,
  ORDER_DISCOUNT_TYPES,
} from "@/types/order-discount.type";
import { model, models, Schema } from "mongoose";

const OrderDiscountPromotionSchema = new Schema(
  {
    promotionType: {
      type: String,
      enum: ["order_discount"],
      default: "order_discount",
      required: true,
    },
    enabled: {
      type: Boolean,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.enabled,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.name,
      maxlength: 80,
    },
    discountType: {
      type: String,
      enum: ORDER_DISCOUNT_TYPES,
      required: true,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.discountType,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.discountValue,
    },
    maximumDiscountAmount: {
      type: Number,
      min: 0,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.maximumDiscountAmount,
    },
    minimumOrderAmount: {
      type: Number,
      required: true,
      min: 0,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.minimumOrderAmount,
    },
    startsAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    endsAt: {
      type: Date,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.endsAt,
      index: true,
    },
    dayMode: {
      type: String,
      enum: ORDER_DISCOUNT_DAY_MODES,
      required: true,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.dayMode,
    },
    days: {
      type: [String],
      enum: ORDER_DISCOUNT_DAYS,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.days,
    },
    startTime: {
      type: String,
      required: true,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.startTime,
    },
    endTime: {
      type: String,
      required: true,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.endTime,
    },
    maximumRedemptions: {
      type: Number,
      min: 1,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.maximumRedemptions,
    },
    redemptionCount: {
      type: Number,
      required: true,
      min: 0,
      default: DEFAULT_ORDER_DISCOUNT_PROMOTION.redemptionCount,
    },
  },
  { timestamps: true },
);

OrderDiscountPromotionSchema.index({ enabled: 1, startsAt: 1, endsAt: 1 });

export const OrderDiscountPromotion =
  models.OrderDiscountPromotion ||
  model("OrderDiscountPromotion", OrderDiscountPromotionSchema);
