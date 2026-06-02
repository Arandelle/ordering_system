export type VoucherUsageRule = {
  isOneTimeUse: boolean;
  isConsumable: boolean;
};

export type VoucherValidityUnit = "minute" | "hour" | "day" | "month" | "year";

export type VoucherValidityRule = {
  duration: number;
  unit: VoucherValidityUnit;
};

export type VoucherRule = {
  enabled: boolean;
  voucherAmount: number;
  minimumPurchase: number;
  usageRule: VoucherUsageRule;
  validityRule: VoucherValidityRule;
};

export const DEFAULT_VOUCHER_USAGE_RULE: VoucherUsageRule = {
  isOneTimeUse: true,
  isConsumable: false,
};

export const VOUCHER_VALIDITY_UNITS: VoucherValidityUnit[] = [
  "minute",
  "hour",
  "day",
  "month",
  "year",
];

export const DEFAULT_VOUCHER_VALIDITY_RULE: VoucherValidityRule = {
  duration: 1,
  unit: "year",
};

export const DEFAULT_VOUCHER_RULE: VoucherRule = {
  enabled: false,
  voucherAmount: 1000,
  minimumPurchase: 3000,
  usageRule: DEFAULT_VOUCHER_USAGE_RULE,
  validityRule: DEFAULT_VOUCHER_VALIDITY_RULE,
};

export const VOUCHER_STATUSES = [
  "active",
  "used",
  "expired",
  "cancelled",
] as const;

export const VOUCHER_SOURCE_TYPES = [
  "promo_card",
  "birthday",
  "campaign",
  "order_refund",
  "manual",
] as const;
