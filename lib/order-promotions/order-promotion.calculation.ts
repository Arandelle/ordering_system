import {
  calculatePromotionDiscountAmount,
  type PromotionDiscountCalculationInput,
} from "@/lib/promotions/promotion.calculation";

type OrderDiscountCalculationInput = PromotionDiscountCalculationInput;

export function calculateOrderDiscountAmount(
  promotion: OrderDiscountCalculationInput,
  discountableAmount: number,
) {
  return calculatePromotionDiscountAmount(promotion, discountableAmount);
}
