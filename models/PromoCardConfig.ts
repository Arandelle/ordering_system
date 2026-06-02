import {
  DEFAULT_PROMO_CARD_DISCOUNT_RULES,
  DEFAULT_PROMO_CARD_VALIDITY_RULE,
  DEFAULT_PROMO_CARD_VOUCHER_RULE,
  PROMO_CARD,
  PROMO_CARD_DAYS,
  PROMO_CARD_VALIDITY_UNITS,
} from "@/lib/promoCard";
import {
  DEFAULT_VOUCHER_USAGE_RULE,
  DEFAULT_VOUCHER_VALIDITY_RULE,
  VOUCHER_VALIDITY_UNITS,
} from "@/types/voucher.types";
import { model, models, Schema } from "mongoose";

const DiscountRuleSchema = new Schema(
  {
    days: {
      type: [String],
      enum: PROMO_CARD_DAYS,
      required: true,
      default: [],
    },
    discountRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  { _id: false },
);

const VoucherRuleSchema = new Schema(
  {
    enabled: { type: Boolean, default: DEFAULT_PROMO_CARD_VOUCHER_RULE.enabled },
    voucherAmount: {
      type: Number,
      default: DEFAULT_PROMO_CARD_VOUCHER_RULE.voucherAmount,
      min: 0,
    },
    minimumPurchase: {
      type: Number,
      default: DEFAULT_PROMO_CARD_VOUCHER_RULE.minimumPurchase,
      min: 0,
    },
    usageRule: {
      isOneTimeUse: {
        type: Boolean,
        default: DEFAULT_VOUCHER_USAGE_RULE.isOneTimeUse,
      },
      isConsumable: {
        type: Boolean,
        default: DEFAULT_VOUCHER_USAGE_RULE.isConsumable,
      },
    },
    validityRule: {
      duration: {
        type: Number,
        required: true,
        default: DEFAULT_VOUCHER_VALIDITY_RULE.duration,
        min: 1,
      },
      unit: {
        type: String,
        enum: VOUCHER_VALIDITY_UNITS,
        required: true,
        default: DEFAULT_VOUCHER_VALIDITY_RULE.unit,
      },
    },
  },
  { _id: false },
);

const ValidityRuleSchema = new Schema(
  {
    duration: {
      type: Number,
      required: true,
      default: DEFAULT_PROMO_CARD_VALIDITY_RULE.duration,
      min: 1,
    },
    unit: {
      type: String,
      enum: PROMO_CARD_VALIDITY_UNITS,
      required: true,
      default: DEFAULT_PROMO_CARD_VALIDITY_RULE.unit,
    },
    expiresAt: {
      type: Date,
      default: DEFAULT_PROMO_CARD_VALIDITY_RULE.expiresAt,
    },
  },
  { _id: false },
);

const PromoCardConfigSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: PROMO_CARD.name,
      maxlength: 80,
    },
    discountRate: {
      type: Number,
      required: true,
      default: PROMO_CARD.discountRate,
      min: 0,
      max: 1,
    },
    purchasePrice: {
      type: Number,
      required: true,
      default: PROMO_CARD.purchasePrice,
      min: 1,
    },
    sku: {
      type: String,
      required: true,
      default: PROMO_CARD.sku,
      trim: true,
    },
    discountRules: {
      type: [DiscountRuleSchema],
      default: DEFAULT_PROMO_CARD_DISCOUNT_RULES,
      validate: [
        (rules: unknown[]) => rules.length <= 2,
        "Only up to 2 discount day rules are allowed.",
      ],
    },
    voucherRule: {
      type: VoucherRuleSchema,
      default: DEFAULT_PROMO_CARD_VOUCHER_RULE,
    },
    validityRule: {
      type: ValidityRuleSchema,
      default: DEFAULT_PROMO_CARD_VALIDITY_RULE,
    },
  },
  { timestamps: true },
);

export const PromoCardConfigModel =
  models.PromoCardConfig ||
  model("PromoCardConfig", PromoCardConfigSchema);
