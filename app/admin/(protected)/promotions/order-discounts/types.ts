import type {
  OrderDiscountDay,
  OrderDiscountDayMode,
  OrderDiscountPromotionConfig,
  OrderDiscountType,
} from "@/types/order-discount.type";

export type OrderDiscountPromotion = Omit<
  OrderDiscountPromotionConfig,
  "startsAt" | "endsAt"
> & {
  _id: string;
  startsAt: string | Date;
  endsAt?: string | Date | null;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderDiscountPromotionsResponse = {
  data: OrderDiscountPromotion[];
};

export type OrderDiscountPromotionMutationResponse = {
  promotion: OrderDiscountPromotion;
};

export type OrderDiscountPromotionSavePayload = {
  enabled: boolean;
  name: string;
  discountType: OrderDiscountType;
  discountValue: number;
  maximumDiscountAmount: number | null;
  minimumOrderAmount: number;
  startsAt: string | null;
  endsAt: string | null;
  dayMode: OrderDiscountDayMode;
  days: OrderDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions: number | null;
};

export type OrderDiscountPromotionForm = {
  enabled: boolean;
  name: string;
  discountType: OrderDiscountType;
  discountValue: string;
  maximumDiscountAmount: string;
  minimumOrderAmount: string;
  startsAt: string;
  endsAt: string;
  dayMode: OrderDiscountDayMode;
  days: OrderDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions: string;
};

export type PromotionStatus =
  | "active"
  | "disabled"
  | "ended"
  | "redeemed_out"
  | "scheduled";

export type PromotionPreviewCondition = {
  value: string;
  label: string;
};

export type PromotionPreview = {
  headline: string;
  description: string;
  discountTarget: string;
  discountValue: string;
  maximumDiscountAmount: string;
  minimumOrderAmount: string;
  conditions: PromotionPreviewCondition[];
};
