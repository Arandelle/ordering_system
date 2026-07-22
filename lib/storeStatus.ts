import { formatTime } from "@/helper/formatter";
import { Days, SettingsType } from "@/hooks/api/useSettings";
import { toPHDate } from "@/utils/toPHDate";

const DAYS: Days[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type StoreClosedStatus = {
  isOpen: false;
  /** Short headline — e.g. "Closed Today" or "Currently Closed" */
  title: string;
  /** Explanation of why the store is closed */
  body: string;
  /** Actionable suggestion for the customer */
  suggestion: string;
};

export type StoreStatus =
  | { isOpen: true }
  | StoreClosedStatus;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes;
  return total === 0 ? 1440 : total; // treat 00:00 as end of day
}

export function getStoreStatus(
  operatingHours: SettingsType["operatingHours"],
): StoreStatus {
  if (!operatingHours) {
    return {
      isOpen: false,
      title: "Hours Not Available",
      body: "Store hours are not available right now.",
      suggestion: "Check back soon or contact us for updates.",
    };
  }

  const { isClosed, days = [], openTime, closeTime } = operatingHours;

  if (isClosed) {
    return {
      isOpen: false,
      title: "Not Accepting Orders",
      body: "We are currently not accepting orders at the moment.",
      suggestion: "You can still browse the menu and build your cart — we'll be ready for you when we reopen!",
    };
  }

  if (!openTime || !closeTime) {
    return {
      isOpen: false,
      title: "Hours Not Configured",
      body: "Store hours are not properly configured.",
      suggestion: "Check back soon or contact us for our operating schedule.",
    };
  }

  const now = toPHDate();
  const todayIndex = (now.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const yesterdayIndex = (todayIndex + 6) % 7;

  const todayLabel = DAYS[todayIndex];
  const yesterdayLabel = DAYS[yesterdayIndex];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = toMinutes(openTime);
  const closeMinutes = toMinutes(closeTime);

  const crossesMidnight = closeMinutes <= openMinutes;

  const closedHoursStatus: StoreClosedStatus = {
    isOpen: false,
    title: "Currently Closed",
    body: `Our ordering hours are ${formatTime(openTime)} – ${formatTime(closeTime)}.`,
    suggestion: "You can still add items to your cart — checkout opens as soon as we're back!",
  };

  if (!crossesMidnight) {
    const isOpenToday =
      days.includes(todayLabel) &&
      currentMinutes >= openMinutes &&
      currentMinutes < closeMinutes;

    if (!isOpenToday) {
      if (!days.includes(todayLabel)) {
        return {
          isOpen: false,
          title: "Closed Today",
          body: "We are closed today and not accepting orders.",
          suggestion: "You can still browse the menu and build your cart — we'll be ready for you on our next open day!",
        };
      }

      return closedHoursStatus;
    }

    return { isOpen: true };
  }

  // Overnight schedule, e.g. 10:00 PM to 2:00 AM
  const isOpenFromTodaySchedule =
    days.includes(todayLabel) && currentMinutes >= openMinutes;

  const isOpenFromYesterdaySchedule =
    days.includes(yesterdayLabel) && currentMinutes < closeMinutes;

  if (isOpenFromTodaySchedule || isOpenFromYesterdaySchedule) {
    return { isOpen: true };
  }

  // Optional: better message when current day is not in schedule and also not in spillover
  if (
    !days.includes(todayLabel) &&
    !(days.includes(yesterdayLabel) && currentMinutes < closeMinutes)
  ) {
    return {
      isOpen: false,
      title: "Closed Today",
      body: "We are closed today and not accepting orders.",
      suggestion: "You can still browse the menu and build your cart — we'll be ready for you on our next open day!",
    };
  }

  return closedHoursStatus;
}
