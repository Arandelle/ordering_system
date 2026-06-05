import {
  DEFAULT_PROMOTION_DISCOUNT,
  DEFAULT_PROMOTION_RULES,
  PROMOTION_TYPES,
  type PromotionConfig,
} from "./promotion-constant";

export type OrderDiscountPromotionConfig = PromotionConfig & {
  promotionType: typeof PROMOTION_TYPES.ORDER_DISCOUNT;
  minimumOrderAmount: number;
  maximumDiscountAmount: number | null;
};

export const DEFAULT_ORDER_DISCOUNT_PROMOTION: OrderDiscountPromotionConfig = {
  ...DEFAULT_PROMOTION_RULES,
  ...DEFAULT_PROMOTION_DISCOUNT,
  promotionType: PROMOTION_TYPES.ORDER_DISCOUNT,
  name: "Whole Order Discount",
  maximumDiscountAmount: null,
  minimumOrderAmount: 100,
};
