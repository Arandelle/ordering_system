import type { OrderDiscountPromotionConfig } from "@/types/promotions/order-discount.type";
import type {
  PromotionDiscountDay,
  PromotionDiscountDayMode,
  PromotionDiscountType,
} from "@/types/promotions/promotion-constant";

export type { PromotionStatus } from "@/types/promotions/promotion-constant";

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
  discountType: PromotionDiscountType;
  discountValue: number;
  maximumDiscountAmount: number | null;
  minimumOrderAmount: number;
  startsAt: string | null;
  endsAt: string | null;
  dayMode: PromotionDiscountDayMode;
  days: PromotionDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions: number | null;
};

export type OrderDiscountPromotionForm = {
  enabled: boolean;
  name: string;
  discountType: PromotionDiscountType;
  discountValue: string;
  maximumDiscountAmount: string;
  minimumOrderAmount: string;
  startsAt: string;
  endsAt: string;
  dayMode: PromotionDiscountDayMode;
  days: PromotionDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions: string;
};

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
