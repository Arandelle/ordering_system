export type VoucherUsageRule = {
  isOneTimeUse: boolean;
  isConsumable: boolean;
};

export type VoucherRule = {
  enabled: boolean;
  voucherAmount: number;
  minimumPurchase: number;
  usageRule: VoucherUsageRule;
};

export const DEFAULT_VOUCHER_USAGE_RULE: VoucherUsageRule = {
  isOneTimeUse: true,
  isConsumable: false,
};

export const DEFAULT_VOUCHER_RULE: VoucherRule = {
  enabled: false,
  voucherAmount: 1000,
  minimumPurchase: 3000,
  usageRule: DEFAULT_VOUCHER_USAGE_RULE,
};

export const VOUCHER_STATUSES = [
  "active",
  "used",
  "expired",
  "cancelled",
] as const;

export const VOUCHER_SOURCE_TYPES = [
  "promo_card",
  "order_refund",
  "manual",
] as const;
