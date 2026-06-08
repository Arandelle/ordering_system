import {
  PROMOTION_DAY_MODE,
  PROMOTION_DISCOUNT_DAYS,
  PROMOTION_DISCOUNT_TYPE,
  type PromotionPayload,
  type PromotionConfig,
} from "@/types/promotions/promotion-constant";
import { getDefaultPromotionEndDate } from "./promotions.service";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
type PromotionBaseConfig = Omit<PromotionConfig, "promotionType">;

export function parseOptionalPromotionDate(
  value: string | Date | null | undefined,
) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizePromotionAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : NaN;
}

export function normalizeMaximumRedemptions(value: unknown) {
  if (value === null || value === undefined || value === 0) return null;

  return Number(value);
}

export function validatePromotionBaseConfig(config: PromotionConfig) {
  if (!config.name) return "Promotion name is required.";

  if (!PROMOTION_DISCOUNT_TYPE.includes(config.discountType)) {
    return "Choose a valid discount type.";
  }

  if (!Number.isFinite(config.discountValue) || config.discountValue <= 0) {
    return "Discount value must be greater than 0.";
  }

  if (
    config.discountType === "percentage" &&
    (config.discountValue <= 0 || config.discountValue > 100)
  ) {
    return "Percentage discount must be between 1 and 100.";
  }

  if (!config.startsAt) {
    return "Promotion start date is required.";
  }

  if (config.endsAt && config.endsAt <= config.startsAt) {
    return "Promotion end date must be after the start date.";
  }

  if (!PROMOTION_DAY_MODE.includes(config.dayMode)) {
    return "Choose a valid day schedule.";
  }

  if (
    config.dayMode === "specific_days" &&
    (config.days.length === 0 ||
      config.days.some((day) => !PROMOTION_DISCOUNT_DAYS.includes(day)))
  ) {
    return "Choose at least one valid promotion day.";
  }

  if (
    !TIME_PATTERN.test(config.startTime) ||
    !TIME_PATTERN.test(config.endTime)
  ) {
    return "Promotion time must use HH:mm format.";
  }

  if (config.endTime <= config.startTime) {
    return "Promotion end time must be after the start time.";
  }

  if (
    config.maximumRedemptions !== null &&
    (!Number.isInteger(config.maximumRedemptions) ||
      config.maximumRedemptions < 1)
  ) {
    return "Maximum redemption must be a positive whole number.";
  }

  return null;
}

export function normalizedPromotionBasePayload(
  body: PromotionPayload,
  defaults: PromotionConfig,
): PromotionBaseConfig {
  const enabled = body.enabled ?? defaults.enabled;
  const name = body.name?.trim() || defaults.name;
  const discountType = body.discountType ?? defaults.discountType;
  const discountValue = normalizePromotionAmount(
    body.discountValue ?? defaults.discountValue,
  );
  const startsAt = parseOptionalPromotionDate(body.startsAt);
  const endsAt =
    parseOptionalPromotionDate(body.endsAt) ??
    getDefaultPromotionEndDate(startsAt);
  const dayMode = body.dayMode ?? defaults.dayMode;
  const days = Array.isArray(body.days) ? body.days : [];
  const startTime = body.startTime ?? defaults.startTime;
  const endTime = body.endTime ?? defaults.endTime;
  const maximumRedemptions = normalizeMaximumRedemptions(
    body.maximumRedemptions,
  );

  return {
    enabled,
    name,
    discountType,
    discountValue,
    startsAt,
    endsAt,
    dayMode,
    days: dayMode === "opening_days" ? [] : days,
    startTime,
    endTime,
    maximumRedemptions,
    redemptionCount: defaults.redemptionCount,
  };
}
