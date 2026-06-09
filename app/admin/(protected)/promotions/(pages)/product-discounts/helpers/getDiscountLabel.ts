import { formatCurrency } from "@/helper/formatCurrency";

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
