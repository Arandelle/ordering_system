"use client";

import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { OrderFormState, ReservationSchema } from "./FormSchema";
import { useMemo } from "react";
import { InputField } from "@/components/ui/FormComponents";
import { IconButton } from "@/components/ui/buttons";
import { QuantityStepper } from "../menu/components/QuantityStepper";

type ReservationPickerProps = {
  value: OrderFormState["reservation"];
  onChange: (field: string, value: string | number) => void;
  errors: Partial<Record<string, string>>;
};

/** Generates the minimum selectable datetime (1 hour from now, rounded to 30-min slots) */
const getMinDateTime = () => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0);
  return now;
};

/** Generates available time slots for a given date (30-min intervals during operating hours) */
const generateTimeSlots = (selectedDate: string): string[] => {
  const slots: string[] = [];
  const startHour = 8; // 8:00 AM
  const endHour = 22; // 10:00 PM

  for (let hour = startHour; hour < endHour; hour++) {
    for (const minute of [0, 30]) {
      const h = String(hour).padStart(2, "0");
      const m = String(minute).padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  }

  // If the selected date is today, filter out past time slots
  const today = new Date().toISOString().split("T")[0];
  if (selectedDate === today) {
    const minDt = getMinDateTime();
    const minTime = `${String(minDt.getHours()).padStart(2, "0")}:${String(minDt.getMinutes()).padStart(2, "0")}`;
    return slots.filter((slot) => slot >= minTime);
  }

  return slots;
};

/** Formats a 24h time string to 12h format for display */
const formatTimeLabel = (time24: string): string => {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

const PARTY_SIZE_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export function ReservationPicker({
  value,
  onChange,
  errors,
}: ReservationPickerProps) {
  // Derive date and time parts from the scheduledAt ISO string
  const { datePart, timePart } = useMemo(() => {
    if (!value?.scheduledAt) return { datePart: "", timePart: "" };
    const dt = new Date(value.scheduledAt);
    if (isNaN(dt.getTime())) return { datePart: "", timePart: "" };
    const date = dt.toISOString().split("T")[0];
    const time = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
    return { datePart: date, timePart: time };
  }, [value?.scheduledAt]);

  const minDate = new Date().toISOString().split("T")[0];
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3); // Allow booking up to 3 months ahead
    return d.toISOString().split("T")[0];
  }, []);

  const timeSlots = useMemo(
    () => (datePart ? generateTimeSlots(datePart) : []),
    [datePart],
  );

  const handleDateChange = (date: string) => {
    // When date changes, reset time if current time is no longer valid
    if (timePart && timeSlots.length > 0) {
      const stillValid = generateTimeSlots(date).includes(timePart);
      if (stillValid) {
        const iso = new Date(`${date}T${timePart}`).toISOString();
        onChange("scheduledAt", iso);
        return;
      }
    }
    // Clear time when date changes to force reselection
    onChange(
      "scheduledAt",
      date ? new Date(`${date}T00:00`).toISOString() : "",
    );
  };

  const handleTimeChange = (time: string) => {
    if (!datePart) return;
    const iso = new Date(`${datePart}T${time}`).toISOString();
    onChange("scheduledAt", iso);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <DynamicIcon
          name="CalendarClock"
          size={16}
          className="text-brand-color-500"
        />
        <h3 className="text-sm font-semibold text-slate-900">
          Reservation Details
        </h3>
      </div>

      <p className="text-xs text-slate-400">
        Select when you&apos;d like to dine in and how many guests.
      </p>

      {/* Date picker */}
      <InputField
        label="Date"
        type="date"
        min={minDate}
        max={maxDate}
        value={datePart}
        onChange={(e) => handleDateChange(e.target.value)}
      />

      {/* Time slots */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Time
        </label>
        {datePart && timeSlots.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto hide-scrollbar">
            {timeSlots.map((slot) => {
              const isSelected = timePart === slot;
              return (
                <IconButton
                  key={slot}
                  type="button"
                  onClick={() => handleTimeChange(slot)}
                  variant={isSelected ? "primary" : "secondary"}
                  className="text-xs rounded-lg"
                  text={formatTimeLabel(slot)}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2">
            {datePart
              ? "No available time slots for this date."
              : "Please select a date first."}
          </p>
        )}
      </div>

      {/* Party size */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Number of Guests
        </label>

        <div className="grid grid-cols-2 items-center gap-3">
          <QuantityStepper
            value={value?.partySize ?? 1}
            min={1}
            max={20}
            onChange={(val) => onChange("partySize", val)}
          />{" "}
          <span className="text-xs text-slate-400">
            {value?.partySize === 1 ? "guest" : "guests"}
          </span>
        </div>
      </div>

      {/* Validation errors */}
      {errors.scheduledAt && (
        <p className="text-xs text-red-500">{errors.scheduledAt}</p>
      )}
      {errors.partySize && (
        <p className="text-xs text-red-500">{errors.partySize}</p>
      )}
    </div>
  );
}
