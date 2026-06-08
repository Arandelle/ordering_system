import {
  DEFAULT_ORDER_DISCOUNT_PROMOTION,
  type OrderDiscountPromotionConfig,
} from "@/types/promotions/order-discount.type";
import {
  normalizeMaximumRedemptions,
  normalizePromotionAmount,
  parseOptionalPromotionDate,
  validatePromotionBaseConfig,
} from "@/lib/promotions/promotion.validation";
import {
  PROMOTION_TYPES,
  type PromotionPayload,
} from "@/types/promotions/promotion-constant";
import { getDefaultPromotionEndDate } from "../promotions/promotions.service";

export type OrderDiscountPromotionPayload = PromotionPayload & {
  maximumDiscountAmount?: number | null;
  minimumOrderAmount?: number;
};

export function normalizeOrderDiscountPromotionPayload(
  body: OrderDiscountPromotionPayload,
  redemptionCount = 0,
): OrderDiscountPromotionConfig {
  const name = body.name?.trim() || DEFAULT_ORDER_DISCOUNT_PROMOTION.name;
  const discountType =
    body.discountType ?? DEFAULT_ORDER_DISCOUNT_PROMOTION.discountType;
  const discountValue = normalizePromotionAmount(
    body.discountValue ?? DEFAULT_ORDER_DISCOUNT_PROMOTION.discountValue,
  );
  const maximumDiscountAmount =
    body.maximumDiscountAmount === null ||
    body.maximumDiscountAmount === undefined ||
    body.maximumDiscountAmount === 0
      ? null
      : normalizePromotionAmount(body.maximumDiscountAmount);
  const minimumOrderAmount = normalizePromotionAmount(
    body.minimumOrderAmount ??
      DEFAULT_ORDER_DISCOUNT_PROMOTION.minimumOrderAmount,
  );
  const startsAt = parseOptionalPromotionDate(body.startsAt);
  const endsAt =
    parseOptionalPromotionDate(body.endsAt) ??
    getDefaultPromotionEndDate(startsAt);
    
  const dayMode = body.dayMode ?? DEFAULT_ORDER_DISCOUNT_PROMOTION.dayMode;
  const days = Array.isArray(body.days) ? body.days : [];
  const startTime =
    body.startTime ?? DEFAULT_ORDER_DISCOUNT_PROMOTION.startTime;
  const endTime = body.endTime ?? DEFAULT_ORDER_DISCOUNT_PROMOTION.endTime;
  const maximumRedemptions = normalizeMaximumRedemptions(
    body.maximumRedemptions,
  );

  return {
    promotionType: PROMOTION_TYPES.ORDER_DISCOUNT,
    enabled: Boolean(body.enabled),
    name,
    discountType,
    discountValue,
    maximumDiscountAmount:
      discountType === "percentage" ? maximumDiscountAmount : null,
    minimumOrderAmount,
    startsAt,
    endsAt,
    dayMode,
    days: dayMode === "opening_days" ? [] : days,
    startTime,
    endTime,
    maximumRedemptions,
    redemptionCount,
  };
}

export function validateOrderDiscountPromotionConfig(
  config: OrderDiscountPromotionConfig,
) {
  const baseValidationError = validatePromotionBaseConfig(config);
  if (baseValidationError) return baseValidationError;

  if (
    config.discountType === "percentage" &&
    config.maximumDiscountAmount !== null &&
    (!Number.isFinite(config.maximumDiscountAmount) ||
      config.maximumDiscountAmount <= 0)
  ) {
    return "Maximum discount amount must be greater than 0.";
  }

  if (
    !Number.isFinite(config.minimumOrderAmount) ||
    config.minimumOrderAmount < 0
  ) {
    return "Minimum order amount cannot be negative.";
  }

  return null;
}
