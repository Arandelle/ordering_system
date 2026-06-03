import {
  DEFAULT_ORDER_DISCOUNT_PROMOTION,
  OrderDiscountPromotionConfig,
} from "@/types/order-discount.type";

export function getCreateDefaultPromotion(): OrderDiscountPromotionConfig {
  return {
    ...DEFAULT_ORDER_DISCOUNT_PROMOTION,
    startsAt: new Date(),
  };
}
