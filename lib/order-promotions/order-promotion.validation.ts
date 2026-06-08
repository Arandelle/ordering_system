import {
  DEFAULT_ORDER_DISCOUNT_PROMOTION,
  type OrderDiscountPromotionConfig,
} from "@/types/promotions/order-discount.type";
import {
  normalizedPromotionBasePayload,
  normalizePromotionAmount,
  validatePromotionBaseConfig,
} from "@/lib/promotions/promotion.validation";
import {
  PROMOTION_TYPES,
  type PromotionPayload,
} from "@/types/promotions/promotion-constant";

export type OrderDiscountPromotionPayload = PromotionPayload & {
  maximumDiscountAmount?: number | null;
  minimumOrderAmount?: number;
};

export function normalizeOrderDiscountPromotionPayload(
  body: OrderDiscountPromotionPayload,
  redemptionCount = 0,
): OrderDiscountPromotionConfig {
  const centralizedPromotionPayload = normalizedPromotionBasePayload(
    body,
    DEFAULT_ORDER_DISCOUNT_PROMOTION,
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

  return {
    ...centralizedPromotionPayload,
    promotionType: PROMOTION_TYPES.ORDER_DISCOUNT,
    maximumDiscountAmount:
      centralizedPromotionPayload.discountType === "percentage"
        ? maximumDiscountAmount
        : null,
    minimumOrderAmount,
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
