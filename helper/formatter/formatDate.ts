export const formatDate = (
  dateString: string | Date | null | undefined,
  fallback = "No date",
) => {
  if (!dateString) return fallback;

  return new Date(dateString).toLocaleString("en-US", {
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
