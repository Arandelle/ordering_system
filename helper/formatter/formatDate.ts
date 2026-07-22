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

export function formatDateInputValue(value?: string | Date | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}
