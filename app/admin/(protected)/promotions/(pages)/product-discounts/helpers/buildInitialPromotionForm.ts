import { formatDateInputValue } from "@/helper/formatter";
import type { ProductDiscountPromotionConfig } from "@/types/promotions/product-discount.type";
import {
  ProductDiscountPromotion,
} from "../types";
import { AdminPromotionForm } from "../../../types/discount-promotion.type";

export function buildInitialPromotionForm(
  promotion: ProductDiscountPromotion | ProductDiscountPromotionConfig,
): AdminPromotionForm {
  return {
    enabled: promotion.enabled,
    name: promotion.name,
    discountType: promotion.discountType,
    discountValue: String(promotion.discountValue),
    productIds: promotion.products.map((product) =>
      "product" in product ? String(product.product) : "",
    ).filter(Boolean),
    categoryIds: promotion.categoryIds ?? [],
    startsAt: formatDateInputValue(promotion.startsAt),
    endsAt: formatDateInputValue(promotion.endsAt),
    dayMode: promotion.dayMode,
    days: promotion.days,
    startTime: promotion.startTime,
    endTime: promotion.endTime,
    maximumRedemptions:
      promotion.maximumRedemptions === null ||
      promotion.maximumRedemptions === undefined
        ? ""
        : String(promotion.maximumRedemptions),
  };
}
