import {
  DEFAULT_PRODUCT_DISCOUNT_PROMOTION,
  type ProductDiscountPromotionConfig,
  type ProductDiscountProductSnapshot,
} from "@/types/promotions/product-discount.type";
import {
  normalizedPromotionBasePayload,
  validatePromotionBaseConfig,
} from "@/lib/promotions/promotion.validation";
import {
  PROMOTION_TYPES,
  type PromotionPayload,
} from "@/types/promotions/promotion-constant";
import mongoose from "mongoose";

export type ProductDiscountPromotionPayload = PromotionPayload & {
  productIds?: string[];
  categoryIds?: string[];
};

export function normalizeProductDiscountPromotionPayload(
  body: ProductDiscountPromotionPayload,
  products: ProductDiscountProductSnapshot[],
  redemptionCount = 0,
): ProductDiscountPromotionConfig {
  const centralizedPromotionPayload = normalizedPromotionBasePayload(
    body,
    DEFAULT_PRODUCT_DISCOUNT_PROMOTION,
  );
  const categoryIds = Array.isArray(body.categoryIds)
    ? [...new Set(body.categoryIds)].filter((id) =>
        mongoose.Types.ObjectId.isValid(id),
      )
    : [];

  return {
    ...centralizedPromotionPayload,
    promotionType: PROMOTION_TYPES.PRODUCT_DISCOUNT,
    products,
    categoryIds,
    redemptionCount,
  };
}

export function validateProductDiscountPromotionConfig(
  config: ProductDiscountPromotionConfig,
) {
  const baseValidationError = validatePromotionBaseConfig(config);
  if (baseValidationError) return baseValidationError;

  if (config.products.length === 0) {
    return "Choose at least one product.";
  }

  return null;
}
