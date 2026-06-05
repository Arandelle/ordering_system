import { DEFAULT_PRODUCT_DISCOUNT_PROMOTION } from "@/types/promotions/product-discount.type";
import {
  PROMOTION_DAY_MODE,
  PROMOTION_DISCOUNT_DAYS,
  PROMOTION_DISCOUNT_TYPE,
  PROMOTION_TYPES,
} from "@/types/promotions/promotion-constant";
import { model, models, Schema } from "mongoose";

const ProductDiscountProductSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
      default: null,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { _id: false },
);

const ProductDiscountPromotionSchema = new Schema(
  {
    promotionType: {
      type: String,
      enum: [PROMOTION_TYPES.PRODUCT_DISCOUNT],
      default: PROMOTION_TYPES.PRODUCT_DISCOUNT,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.enabled,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.name,
      maxlength: 80,
    },
    discountType: {
      type: String,
      enum: PROMOTION_DISCOUNT_TYPE,
      required: true,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.discountType,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.discountValue,
    },
    products: {
      type: [ProductDiscountProductSchema],
      default: [],
      validate: {
        validator(products: unknown[]) {
          return products.length > 0;
        },
        message: "Choose at least one product.",
      },
    },
    categoryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Category" }],
      default: [],
    },
    startsAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    endsAt: {
      type: Date,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.endsAt,
      index: true,
    },
    dayMode: {
      type: String,
      enum: PROMOTION_DAY_MODE,
      required: true,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.dayMode,
    },
    days: {
      type: [String],
      enum: PROMOTION_DISCOUNT_DAYS,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.days,
    },
    startTime: {
      type: String,
      required: true,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.startTime,
    },
    endTime: {
      type: String,
      required: true,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.endTime,
    },
    maximumRedemptions: {
      type: Number,
      min: 1,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.maximumRedemptions,
    },
    redemptionCount: {
      type: Number,
      required: true,
      min: 0,
      default: DEFAULT_PRODUCT_DISCOUNT_PROMOTION.redemptionCount,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

ProductDiscountPromotionSchema.index({ enabled: 1, startsAt: 1, endsAt: 1 });
ProductDiscountPromotionSchema.index({ "products.product": 1, enabled: 1 });

export const ProductDiscountPromotion =
  models.ProductDiscountPromotion ||
  model("ProductDiscountPromotion", ProductDiscountPromotionSchema);
