import { PromotionDiscountDay } from "@/types/promotions/promotion-constant";

export const toggleDay = (
  days: PromotionDiscountDay[],
  day: PromotionDiscountDay,
) => {
  return days.includes(day)
    ? days.filter((candidate) => candidate !== day)
    : [...days, day];
};
