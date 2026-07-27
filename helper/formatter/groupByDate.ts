export interface DateGroup<T> {
  label: string;
  items: T[];
}

/**
 * Groups a sorted list of notifications by date: "Today", "Yesterday",
 * or the full date (e.g. "July 25, 2026") for anything older.
 */

/**
 * Groups items by date: "Today", "Yesterday", or full date.
 * Pass a getter to extract the date string from each item.
 */

export function groupByDate<T>(
  items: T[],
  getDate: (item: T) => string,
): DateGroup<T>[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Map<string, { label: string; items: T[] }> = new Map();

  for (const item of items) {
    const date = new Date(getDate(item));
    const dayStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const key = dayStart.toISOString().split("T")[0];

    let label: string;

    if (dayStart.getTime() === today.getTime()) {
      label = "Today";
    } else if (dayStart.getTime() === yesterday.getTime()) {
      label = "Yesterday";
    } else {
      label = date.toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!groups.has(key)) {
      groups.set(key, { label, items: [] });
    }

    groups.get(key)!.items.push(item);
  }

  return Array.from(groups.values());
}
