import { DEFAULT_VOUCHER_RULE } from "@/types/voucher.types";
import type { VoucherRule } from "@/types/voucher.types";
import { getPromotionDay } from "./promotions/promotions.service";
import {
  PROMOTION_DISCOUNT_DAYS,
  PromotionDiscountDay,
} from "@/types/promotions/promotion-constant";
import { roundMoney } from "./promotions/promotion.calculation";

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
  validityRule: PromoCardValidityRule;
};


export type PromoCardDiscountRule = {
  days: PromotionDiscountDay[];
  discountRate: number;
};

export type PromoCardVoucherRule = VoucherRule;

export type PromoCardValidityUnit = "day" | "month" | "year";

export type PromoCardValidityRule = {
  duration: number;
  unit: PromoCardValidityUnit;
  expiresAt: Date | null;
};

export const PROMO_CARD_DAYS: PromotionDiscountDay[] = [
  ...PROMOTION_DISCOUNT_DAYS,
];

export const PROMO_CARD_VALIDITY_UNITS: PromoCardValidityUnit[] = [
  "day",
  "month",
  "year",
];

export const DEFAULT_PROMO_CARD_DISCOUNT_RULES: PromoCardDiscountRule[] = [
  { days: PROMO_CARD_DAYS, discountRate: PROMO_CARD.discountRate },
];

export const DEFAULT_PROMO_CARD_VOUCHER_RULE: PromoCardVoucherRule =
  DEFAULT_VOUCHER_RULE;

export const DEFAULT_PROMO_CARD_VALIDITY_RULE: PromoCardValidityRule = {
  duration: 1,
  unit: "year",
  expiresAt: null,
};

export function calculatePromoCardDiscount(
  subtotal: number,
  discountRate: number = PROMO_CARD.discountRate,
): number {
  if (subtotal <= 0) return 0;
  return roundMoney(subtotal * discountRate);
}

export function calculatePromoCardTotal(
  subtotal: number,
  discountRate: number = PROMO_CARD.discountRate,
): number {
  const discount = calculatePromoCardDiscount(subtotal, discountRate);
  return roundMoney(Math.max(subtotal - discount, 0));
}

export function getPromoCardDay(date = new Date()): PromotionDiscountDay {
  return getPromotionDay(date);
}

export function getPromoCardDiscountRateForDay(
  rules: PromoCardDiscountRule[] | undefined,
  day = getPromoCardDay(),
  fallbackRate: number = PROMO_CARD.discountRate,
): number {
  const rule = rules?.find((candidate) => candidate.days.includes(day));
  return rule?.discountRate ?? fallbackRate;
}
