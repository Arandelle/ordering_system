import { formatCurrency } from "@/helper/formatter/";

type PromotionDiscountSummary = {
  discountType: "fixed" | "percentage";
  discountValue: number;
};

export function getDiscountLabel(promotion: PromotionDiscountSummary) {
  if (promotion.discountType === "fixed") {
    return `${formatCurrency(promotion.discountValue)} off`;
  }

  return `${promotion.discountValue}% off`;
}
