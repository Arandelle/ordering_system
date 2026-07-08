"use client";

import { useSettings } from "@/hooks/api/useSettings";
import { getStoreStatus, StoreClosedStatus } from "@/lib/storeStatus";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

/**
 * Floating banner that tells customers whether the store is currently open
 * or closed. Only renders when the store is NOT open — hidden completely
 * when operating hours are active so there's no visual noise.
 *
 * Placed in the customer layout so it's visible across all pages (menu,
 * checkout, profile, etc.), not just the menu section.
 */
export default function StoreStatusBanner() {
  const { data: settings, isLoading } = useSettings();

  if (isLoading || !settings?.operatingHours) return null;

  const status = getStoreStatus(settings.operatingHours);

  if (status.isOpen) return null;

  const closed = status as StoreClosedStatus;

  return (
    <div className="fixed top-20 sm:inset-x-auto inset-x-0 xs:right-0 sm:right-12 z-50 px-3">
      <div className="mx-auto max-w-60 flex flex-col items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-200/60 px-4 py-2.5 shadow-md shadow-gray-900/5">
        <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-amber-100">
          <DynamicIcon name="TriangleAlert" size={15} className="text-amber-500" />
        </span>
        <p className="text-xs font-bold text-red-500 leading-snug text-center">
          {closed.title}
        </p>
        <p className="text-xs text-gray-600 leading-snug">
          {closed.body}
        </p>
        <p className="text-xs text-gray-600 leading-snug">
          {closed.suggestion}
        </p>
      </div>
    </div>
  );
}
