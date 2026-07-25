import { formatDate } from "./formatDate";

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

  const groups: Map<string, T[]> = new Map();

  for (const item of items){
    const date = new Date(getDate(item));
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let label: string;
    if(dayStart.getTime() === today.getTime()){
      label = "Today";
    } else if (dayStart.getTime() === yesterday.getTime()){
      label = "Yesterday"
    } else{
      label = formatDate(date, {weekday: true})
    }

    if(!groups.has(label)){
      groups.set(label, []);
    }

    groups.get(label)!.push(item)
  }
  
  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items
  }))
}
