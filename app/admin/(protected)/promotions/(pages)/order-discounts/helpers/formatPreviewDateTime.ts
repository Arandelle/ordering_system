export function formatPreviewDateTime(
  dateValue: string,
  timeValue: string,
  fallback: string,
) {
  if (!dateValue) return fallback;

  const date = new Date(`${dateValue}T${timeValue || "00:00"}`);

  if (Number.isNaN(date.getTime())) return fallback;

  const day = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
  }).format(date);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(date);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${day} ${month}, ${weekday} at ${time}`;
}
