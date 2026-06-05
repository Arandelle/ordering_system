import type { OrderDiscountPromotionConfig } from "@/types/promotions/order-discount.type";

export type ActiveOrderDiscountPromotion = Omit<
  OrderDiscountPromotionConfig,
  "startsAt" | "endsAt"
> & {
  id: string;
  startsAt: string;
  endsAt: string | null;
};

export type ActivePromotion = ActiveOrderDiscountPromotion;

export type ActivePromotionsResponse = {
  data: ActivePromotion[];
};