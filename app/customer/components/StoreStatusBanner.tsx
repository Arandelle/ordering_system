"use client";

import { useSettings } from "@/hooks/api/useSettings";
import { getStoreStatus, StoreClosedStatus } from "@/lib/storeStatus";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { useEffect, useState } from "react";
import { IconButton } from "@/components/ui/buttons";

/**
 * Floating banner that tells customers whether the store is currently open
 * or closed. Only renders when the store is NOT open — hidden completely
 * when operating hours are active so there's no visual noise.
 *
 * Re-evaluates the store status every 60 seconds so transitions
 * (closed → open, open → closed) are detected without a page refresh.
 *
 * Placed in the customer layout so it's visible across all pages (menu,
 * checkout, profile, etc.), not just the menu section.
 */
export default function StoreStatusBanner() {
  const { data: settings, isLoading } = useSettings();
  const [dismissed, setDismissed] = useState(false);
  // Tick forces a re-render every 60s so getStoreStatus picks up time changes
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Reset dismissal when settings change (e.g. admin updates hours)
  useEffect(() => {
    setDismissed(false);
  }, [settings?.operatingHours?.isClosed, settings?.operatingHours?.openTime, settings?.operatingHours?.closeTime]);

  if (isLoading || !settings?.operatingHours) return null;

  const status = getStoreStatus(settings.operatingHours);

  if (status.isOpen) return null;

  const closed = status as StoreClosedStatus;

  if (dismissed) {
    return (
      <IconButton
        onClick={() => setDismissed(false)}
        variant="danger"
        icon={{ name: "Ban", size: 12 }}
        text="Closed today"
        className="text-xs p-2 rounded-lg fixed right-4 top-22 z-50"
      />
    );
  }

  return (
    <div className="fixed top-22 sm:inset-x-auto inset-x-0 xs:right-0 sm:right-12 z-50 px-3">
      <div className="mx-auto max-w-60 flex flex-col items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-200/60 px-4 py-2.5 shadow-md shadow-gray-900/5 relative">
        <IconButton
          onClick={() => setDismissed(true)}
          variant="ghost"
          icon={{ name: "X", size: 12 }}
          className="absolute top-1 right-1 rounded-lg"
        />
        <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-amber-100">
          <DynamicIcon
            name="TriangleAlert"
            size={15}
            className="text-amber-500"
          />
        </span>
        <p className="text-xs font-bold text-red-500 leading-snug text-center">
          {closed.title}
        </p>
        <p className="text-xs text-gray-600 leading-snug">{closed.body}</p>
        <p className="text-xs text-gray-600 leading-snug">
          {closed.suggestion}
        </p>
      </div>
    </div>
  );
}
