export const PROMOTION_TYPES = {
  ORDER_DISCOUNT: "order_discount",
  PRODUCT_DISCOUNT: "product_discount",
} as const;

export type PromotionTypes =
  (typeof PROMOTION_TYPES)[keyof typeof PROMOTION_TYPES];

export type PromotionDiscountType = "percentage" | "fixed";

export type PromotionDiscountDay =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";

export type PromotionDiscountDayMode = "opening_days" | "specific_days";

export type PromotionRules = {
  enabled: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  dayMode: PromotionDiscountDayMode;
  days: PromotionDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions: number | null;
  redemptionCount: number;
  discountType: PromotionDiscountType;
  discountValue: number;
};

export type PromotionConfig = PromotionRules & {
  promotionType: PromotionTypes;
  name: string;
};

export const PROMOTION_DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export type PromotionDiscountDays = (typeof PROMOTION_DAYS)[number];

export const PROMOTION_DAY_MODE: PromotionDiscountDayMode[] = [
  "opening_days",
  "specific_days",
] as const;

export const PROMOTION_DISCOUNT_TYPE: PromotionDiscountType[] = [
  "percentage",
  "fixed",
] as const;

export const DEFAULT_PROMOTION_RULES: PromotionRules = {
  enabled: false,
  startsAt: null,
  endsAt: null,
  dayMode: "opening_days",
  days: [],
  startTime: "00:00",
  endTime: "23:59",
  maximumRedemptions: null,
  redemptionCount: 0,
  discountType: "percentage",
  discountValue: 10,
};
