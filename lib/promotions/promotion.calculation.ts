import type { PromotionDiscountType } from "@/types/promotions/promotion-constant";
import { minMoney, multiplyMoney } from "@/lib/money";

export type PromotionDiscountCalculationInput = {
  discountType: PromotionDiscountType;
  discountValue: number;
  maximumDiscountAmount?: number | null;
};

export function calculatePromotionDiscountAmount(
  promotion: PromotionDiscountCalculationInput,
  discountableAmount: number,
) {
  if (discountableAmount <= 0) return 0;

  if (promotion.discountType === "fixed") {
    return minMoney(promotion.discountValue, discountableAmount);
  }

  const percentageDiscount = multiplyMoney(
    discountableAmount,
    promotion.discountValue / 100,
  );

  return promotion.maximumDiscountAmount
    ? minMoney(percentageDiscount, promotion.maximumDiscountAmount)
    : percentageDiscount;
}
