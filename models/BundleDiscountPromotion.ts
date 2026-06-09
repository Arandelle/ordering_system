import {
  BundleDiscountProductSnapshot,
  DEFAULT_BUNDLE_PROMOTION_DISCOUNT,
} from "@/types/promotions/bundle-discount.type";
import {
  PROMOTION_DAY_MODE,
  PROMOTION_DISCOUNT_DAYS,
  PROMOTION_DISCOUNT_TYPE,
  PROMOTION_TYPES,
} from "@/types/promotions/promotion-constant";
import { model, models, Schema } from "mongoose";

const BundleDiscountProductSchema = new Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    _id: false,
  },
);

const BundleDiscountPromotionSchema = new Schema(
  {
    promotionType: {
      type: String,
      enum: [PROMOTION_TYPES.BUNDLE_DISCOUNT],
      default: PROMOTION_TYPES.BUNDLE_DISCOUNT,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: DEFAULT_BUNDLE_PROMOTION_DISCOUNT.name,
      maxLength: 80,
    },
    discountType: {
      type: String,
      enum: PROMOTION_DISCOUNT_TYPE,
      required: true,
      default: DEFAULT_BUNDLE_PROMOTION_DISCOUNT.discountType,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      default: DEFAULT_BUNDLE_PROMOTION_DISCOUNT.discountValue,
    },
    products: {
      type: [BundleDiscountProductSchema],
      default: [],
      validate: {
        validator(products: BundleDiscountProductSnapshot[]) {
            if(!Array.isArray(products) || products.length === 0) return false;
            return(
                products.every((product) => product.quantity >=1) &&
                products.reduce((total, product) => total + product.quantity, 0) >= 2
            )
        },
        message: "A bundle needs at least 2 items, or 1 item with a quantity of 2 or more",
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
      default: DEFAULT_BUNDLE_PROMOTION_DISCOUNT.endsAt,
      index: true,
    },
    dayMode: {
      type: String,
      enum: PROMOTION_DAY_MODE,
      default: DEFAULT_BUNDLE_PROMOTION_DISCOUNT.dayMode,
      required: true,
    },
    days: {
      type: [String],
      enum: PROMOTION_DISCOUNT_DAYS,
      default: DEFAULT_BUNDLE_PROMOTION_DISCOUNT.days,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      default: DEFAULT_BUNDLE_PROMOTION_DISCOUNT.startTime,
    },
    endTime: {
      type: String,
      required: true,
      default: DEFAULT_BUNDLE_PROMOTION_DISCOUNT.endTime,
    },
    maximumRedemptions: {
      type: Number,
      min: 1,
      default: DEFAULT_BUNDLE_PROMOTION_DISCOUNT.maximumRedemptions,
    },
    redemptionCount: {
      type: Number,
      required: true,
      min: 0,
      default: DEFAULT_BUNDLE_PROMOTION_DISCOUNT.redemptionCount,
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

BundleDiscountPromotionSchema.index({enabled: 1, startsAt: 1, endsAt: 1});
BundleDiscountPromotionSchema.index({"products.product" : 1, enabled: 1});


export const BundleDiscountPromotion = models.BundleDiscountPromotion || model("BundleDiscountPromotion", BundleDiscountPromotionSchema)
