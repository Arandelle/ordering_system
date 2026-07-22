"use client";

import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { InputField } from "@/components/ui/FormComponents";
import { IconButton } from "@/components/ui/buttons";
import { formatDate, formatTime } from "@/helper/formatter";
import {
  getLocalDate,
  fromMinutes,
  validatePickupTime,
  PICKUP_MIN_ADVANCE_MINUTES,
  type OperatingHours,
} from "@/lib/operatingHours";
import { useMemo } from "react";

type PickupTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  operatingHours: OperatingHours | null | undefined;
};

/** Quick-select presets: minutes from now */
const PRESETS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
];

export function PickupTimePicker({
  value,
  onChange,
  error,
  operatingHours,
}: PickupTimePickerProps) {
  const isStoreGloballyClosed = operatingHours?.isClosed === true;

  // Derive date and time parts from the ISO string using local time
  const { datePart, timePart } = useMemo(() => {
    if (!value) return { datePart: "", timePart: "" };
    const dt = new Date(value);
    if (isNaN(dt.getTime())) return { datePart: "", timePart: "" };
    const date = getLocalDate(dt);
    const time = fromMinutes(dt.getHours() * 60 + dt.getMinutes());
    return { datePart: date, timePart: time };
  }, [value]);

  const minDate = getLocalDate(new Date());
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return getLocalDate(d);
  }, []);

  // Full business-rule validation (same function used server-side)
  const timeWarning = useMemo(
    () => validatePickupTime(value, operatingHours),
    [value, operatingHours],
  );

  const handleDateChange = (date: string) => {
    if (!date) {
      onChange("");
      return;
    }
    // Keep the time if already set, otherwise just set the date
    if (timePart) {
      const iso = new Date(`${date}T${timePart}`).toISOString();
      onChange(iso);
    } else {
      onChange(new Date(`${date}T00:00`).toISOString());
    }
  };

  const handleTimeChange = (time: string) => {
    if (!datePart || !time) return;
    const iso = new Date(`${datePart}T${time}`).toISOString();
    onChange(iso);
  };

  /** Set the pickup time to N minutes from now */
  const handlePreset = (minutes: number) => {
    const dt = new Date();
    dt.setMinutes(dt.getMinutes() + minutes, 0, 0);
    onChange(dt.toISOString());
  };

  const openTime = operatingHours?.openTime ?? "08:00";
  const closeTime = operatingHours?.closeTime ?? "22:00";

  if (isStoreGloballyClosed) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-800">Pickup unavailable</p>
        <p className="mt-1 text-sm text-red-700">
          The store is currently closed and not accepting pickup orders.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <DynamicIcon name="Clock" size={16} className="text-brand-color-500" />
        <h3 className="text-sm font-semibold text-slate-900">Pickup Time</h3>
      </div>

      <p className="text-xs text-slate-400">
        Select when you plan to pick up your order.
      </p>

      {/* Quick-select capsules */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Quick select
        </label>
        <div className="flex gap-2">
          {PRESETS.map((preset) => {
            const dt = new Date();
            dt.setMinutes(dt.getMinutes() + preset.minutes, 0, 0);
            const presetIso = dt.toISOString();

            // Check if the current value matches this preset (within 1 min tolerance)
            const isSelected =
              !!value &&
              Math.abs(new Date(value).getTime() - dt.getTime()) < 60_000;

            // Check if this preset would be valid
            const presetError = validatePickupTime(presetIso, operatingHours);
            const isDisabled = !!presetError;

            return (
              <IconButton
                key={preset.minutes}
                type="button"
                onClick={() => handlePreset(preset.minutes)}
                variant={isSelected ? "primary" : "secondary"}
                disabled={isDisabled}
                className="text-xs rounded-lg flex-1"
                text={preset.label}
              />
            );
          })}
        </div>
      </div>

      {/* Date picker */}
      <InputField
        label={`Date`}
        subLabel={value && formatDate(value, { weekday: true, time: false })}
        type="date"
        min={minDate}
        max={maxDate}
        value={datePart}
        onChange={(e) => handleDateChange(e.target.value)}
      />

      {/* Manual time input */}
      <div>
        {datePart ? (
          <>
            <InputField
              label="Time"
              subLabel={`Operating hours: ${formatTime(openTime)} – ${formatTime(closeTime)}. Min ${PICKUP_MIN_ADVANCE_MINUTES} min advance`}
              type="time"
              value={timePart}
              onChange={(e) => handleTimeChange(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-slate-400"></p>
          </>
        ) : (
          <p className="text-xs text-slate-400 py-2">
            Please select a date first.
          </p>
        )}
      </div>

      {/* Validation warning / error */}
      {timeWarning && (
        <p className="text-xs text-red-500 font-medium">{timeWarning}</p>
      )}

      {/* Schema-level error from context */}
      {error && !timeWarning && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
