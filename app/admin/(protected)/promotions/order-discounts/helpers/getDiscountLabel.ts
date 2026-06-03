import { formatCurrency } from "@/helper/formatCurrency";
import { OrderDiscountPromotion } from "../types";

export function getDiscountLabel(promotion: OrderDiscountPromotion) {
  if (promotion.discountType === "fixed") {
    return `${formatCurrency(promotion.discountValue)} off`;
  }

  return `${promotion.discountValue}% off${
    promotion.maximumDiscountAmount
      ? ` up to ${formatCurrency(promotion.maximumDiscountAmount)}`
      : ""
  }`;
}
