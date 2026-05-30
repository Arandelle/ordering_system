export const PROMO_CARD = {
  name: "Harrison Promo Card",
  discountRate: 0.3,
  purchasePrice: 2500,
  sku: "HARRISON-PROMO-CARD",
} as const;

export type PromoCardConfig = {
  name: string;
  discountRate: number;
  purchasePrice: number;
  sku: string;
  discountRules: PromoCardDiscountRule[];
  voucherRule: PromoCardVoucherRule;
};

export type PromoCardDay =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";

export type PromoCardDiscountRule = {
  days: PromoCardDay[];
  discountRate: number;
};

export type PromoCardVoucherRule = {
  enabled: boolean;
  voucherAmount: number;
  minimumPurchase: number;
};

export const PROMO_CARD_DAYS: PromoCardDay[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export const DEFAULT_PROMO_CARD_DISCOUNT_RULES: PromoCardDiscountRule[] = [
  { days: PROMO_CARD_DAYS, discountRate: PROMO_CARD.discountRate },
];

export const DEFAULT_PROMO_CARD_VOUCHER_RULE: PromoCardVoucherRule = {
  enabled: false,
  voucherAmount: 1000,
  minimumPurchase: 3000,
};

export function calculatePromoCardDiscount(
  subtotal: number,
  discountRate: number = PROMO_CARD.discountRate,
): number {
  if (subtotal <= 0) return 0;
  return Number((subtotal * discountRate).toFixed(2));
}

export function calculatePromoCardTotal(
  subtotal: number,
  discountRate: number = PROMO_CARD.discountRate,
): number {
  const discount = calculatePromoCardDiscount(subtotal, discountRate);
  return Number(Math.max(subtotal - discount, 0).toFixed(2));
}

export function getPromoCardDay(date = new Date()): PromoCardDay {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Manila",
  }).format(date) as PromoCardDay;
}

export function getPromoCardDiscountRateForDay(
  rules: PromoCardDiscountRule[] | undefined,
  day = getPromoCardDay(),
  fallbackRate: number = PROMO_CARD.discountRate,
): number {
  const rule = rules?.find((candidate) => candidate.days.includes(day));
  return rule?.discountRate ?? fallbackRate;
}
