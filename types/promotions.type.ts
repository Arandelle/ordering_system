import type {
  OrderDiscountDay,
  OrderDiscountDayMode,
  OrderDiscountType,
} from "@/types/order-discount.type";

export type ActivePromotionKind = "order_discount";

export type ActivePromotion = {
  id: string;
  kind: ActivePromotionKind;
  name: string;
  title: string;
  description: string;
  discountType: OrderDiscountType;
  discountValue: number;
  maximumDiscountAmount: number | null;
  minimumOrderAmount: number;
  startsAt: string;
  endsAt: string | null;
  dayMode: OrderDiscountDayMode;
  days: OrderDiscountDay[];
  startTime: string;
  endTime: string;
  validUntilLabel: string;
};

export type ActivePromotionsResponse = {
  data: ActivePromotion[];
};
