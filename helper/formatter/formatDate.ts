import { toPHDate } from "@/utils/toPHDate";

type FormatDateOptions = {
  weekday?: boolean;
  date?: boolean;
  time?: boolean;
  fallback?: string;
};

export function formatDate(
  value: string | Date | null | undefined,
  {
    weekday = false,
    date = true,
    time = true,
    fallback = "No date",
  }: FormatDateOptions = {},
) {
  if (!value) return fallback;

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  const options: Intl.DateTimeFormatOptions = {};

  if (weekday) {
    options.weekday = "short";
  }

  if (date) {
    options.month = "short";
    options.day = "numeric";
    options.year = "numeric";
  }

  if (time) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return parsedDate.toLocaleString("en-US", options);
}

export const formatDateWithDay = (
  dateString: string | Date | null | undefined,
  fallback = "No date",
) => {
  if (!dateString) return fallback;

  return new Date(dateString).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateOnly = (
  dateString: string | Date | null | undefined,
  fallback = "No date",
) => {
  if (!dateString) return fallback;

  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/** Extract YYYY-MM-DD from a date value (PH timezone, for date inputs) */
export function formatDateInputValue(value?: string | Date | null) {
  if (!value) return "";

  const date = toPHDate(new Date(value));
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Extract HH:mm from a date value (PH timezone, for time inputs) */
export function toTimeInputValue(value?: string | Date | null): string {
  if (!value) return "00:00";

  const date = toPHDate(new Date(value));
  if (Number.isNaN(date.getTime())) return "00:00";

  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}
