export type ProductDiscountPromotionKind = "product_discount";

export type ProductDiscountType = "percentage" | "fixed";

export type ProductDiscountDay =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";

export type ProductDiscountDayMode = "opening_days" | "specific_days";

export type ProductDiscountProductSnapshot = {
  product: string;
  name: string;
  price: number | null;
  imageUrl: string;
  category: string | null;
};

export type ProductDiscountPromotionConfig = {
  promotionType: ProductDiscountPromotionKind;
  enabled: boolean;
  name: string;
  discountType: ProductDiscountType;
  discountValue: number;
  products: ProductDiscountProductSnapshot[];
  categoryIds: string[];
  startsAt: Date | null;
  endsAt: Date | null;
  dayMode: ProductDiscountDayMode;
  days: ProductDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions: number | null;
  redemptionCount: number;
};

export const PRODUCT_DISCOUNT_TYPES: ProductDiscountType[] = [
  "percentage",
  "fixed",
];

export const PRODUCT_DISCOUNT_DAYS: ProductDiscountDay[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export const PRODUCT_DISCOUNT_DAY_MODES: ProductDiscountDayMode[] = [
  "opening_days",
  "specific_days",
];

export const DEFAULT_PRODUCT_DISCOUNT_DURATION_DAYS = 180;

export const DEFAULT_PRODUCT_DISCOUNT_PROMOTION: ProductDiscountPromotionConfig =
  {
    promotionType: "product_discount",
    enabled: false,
    name: "Product Discount",
    discountType: "percentage",
    discountValue: 10,
    products: [],
    categoryIds: [],
    startsAt: new Date(),
    endsAt: null,
    dayMode: "opening_days",
    days: [],
    startTime: "00:00",
    endTime: "23:59",
    maximumRedemptions: null,
    redemptionCount: 0,
  };
