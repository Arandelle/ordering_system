import { getStoreStatus } from "@/lib/storeStatus";
import type {
  OrderDiscountDay,
  OrderDiscountDayMode,
} from "@/types/order-discount.type";

export const PROMOTION_TIME_ZONE = "Asia/Manila";

type OperatingHours = Parameters<typeof getStoreStatus>[0];

type OrderPromotionScheduleConfig = {
  dayMode: OrderDiscountDayMode;
  days: OrderDiscountDay[];
  startTime: string;
  endTime: string;
};

export function getPromotionDay(date = new Date()): OrderDiscountDay {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: PROMOTION_TIME_ZONE,
  }).format(date) as OrderDiscountDay;
}

export function getPromotionTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: PROMOTION_TIME_ZONE,
  }).format(date);
}

export function isWithinPromotionTimeWindow(
  startTime: string,
  endTime: string,
  date = new Date(),
) {
  const currentTime = getPromotionTime(date);
  return currentTime >= startTime && currentTime <= endTime;
}

export function isOrderPromotionScheduleActive(
  promotion: OrderPromotionScheduleConfig,
  operatingHours: OperatingHours | null,
  date = new Date(),
) {
  const currentDay = getPromotionDay(date);

  if (
    promotion.dayMode === "specific_days" &&
    !promotion.days.includes(currentDay)
  ) {
    return false;
  }

  if (promotion.dayMode === "opening_days") {
    if (!operatingHours) return false;
    if (!getStoreStatus(operatingHours).isOpen) return false;
  }

  return isWithinPromotionTimeWindow(
    promotion.startTime,
    promotion.endTime,
    date,
  );
}
