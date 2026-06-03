import { OrderDiscountPromotionConfig } from "@/lib/orderDiscountPromotion";

export type OrderDiscountPromotion = OrderDiscountPromotionConfig & {
  _id: string;
  startsAt: string | Date;
  endsAt?: string | Date | null;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderDiscountPromotionsResponse = {
  data: OrderDiscountPromotion[];
};

