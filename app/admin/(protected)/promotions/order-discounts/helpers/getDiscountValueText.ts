import { formatCurrency } from "@/helper/formatCurrency";
import { OrderDiscountPromotionForm } from "../types";

export function getDiscountValueText(form: OrderDiscountPromotionForm) {
  const discountValue = Number(form.discountValue || 0);

  return form.discountType === "percentage"
    ? `${discountValue}%`
    : formatCurrency(discountValue);
}
