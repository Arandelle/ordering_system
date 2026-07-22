/**
 * Convert any date to its PH-local representation using IANA timezone.
 * Works correctly on both local dev machines and UTC-based servers (Vercel).
 * Pass no argument to get the current time in PH.
 */
export function toPHDate(date: Date = new Date()): Date {
  const localStr = date.toLocaleString("en-US", { timeZone: "Asia/Manila" });
  return new Date(localStr);
}