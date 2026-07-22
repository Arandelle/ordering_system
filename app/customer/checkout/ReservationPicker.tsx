"use client";

import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { OrderFormState } from "./FormSchema";
import { useMemo } from "react";
import { InputField } from "@/components/ui/FormComponents";
import { IconButton } from "@/components/ui/buttons";
import { QuantityStepper } from "../menu/components/QuantityStepper";
import { formatDate, formatTime } from "@/helper/formatter";
import {
  generateTimeSlots,
  getLocalDate,
  fromMinutes,
  isOperatingDay,
  type OperatingHours,
} from "@/lib/operatingHours";

type ReservationPickerProps = {
  value: OrderFormState["reservation"];
  onChange: (field: string, value: string | number) => void;
  errors: Partial<Record<string, string>>;
  operatingHours: OperatingHours | null | undefined;
};

export function ReservationPicker({
  value,
  onChange,
  errors,
  operatingHours,
}: ReservationPickerProps) {
  const isStoreGloballyClosed = operatingHours?.isClosed === true;

  // Derive date and time parts from the scheduledAt ISO string using local time
  const { datePart, timePart } = useMemo(() => {
    if (!value?.scheduledAt) return { datePart: "", timePart: "" };
    const dt = new Date(value.scheduledAt);
    if (isNaN(dt.getTime())) return { datePart: "", timePart: "" };
    const date = getLocalDate(dt);
    const time = fromMinutes(dt.getHours() * 60 + dt.getMinutes());
    return { datePart: date, timePart: time };
  }, [value?.scheduledAt]);

  const minDate = getLocalDate(new Date());
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return getLocalDate(d);
  }, []);

  const timeSlots = useMemo(
    () => (datePart ? generateTimeSlots(datePart, operatingHours) : []),
    [datePart, operatingHours],
  );

  // Check if the selected date falls on a closed day
  const isClosedDay = useMemo(() => {
    if (!datePart) return false;
    return !isOperatingDay(datePart, operatingHours);
  }, [datePart, operatingHours]);

  const handleDateChange = (date: string) => {
    // When date changes, keep time if it's still valid for the new date
    if (timePart) {
      const newSlots = generateTimeSlots(date, operatingHours);
      if (newSlots.includes(timePart)) {
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

  if (isStoreGloballyClosed) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-800">
          Reservations unavailable
        </p>
        <p className="mt-1 text-sm text-red-700">
          The store is currently closed and not accepting reservations.
        </p>
      </div>
    );
  }

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
        Select when you&apos;d like to visit and how many guests.
      </p>

      {/* Date picker */}
      <InputField
        label={`Date : ${value?.scheduledAt && formatDate(value.scheduledAt, {weekday: true, time: false})}`}
        type="date"
        min={minDate}
        max={maxDate}
        value={datePart}
        onChange={(e) => handleDateChange(e.target.value)}
      />

      {/* Closed day warning */}
      {isClosedDay && (
        <p className="text-xs text-red-500 font-medium">
          We&apos;re closed on this day. Please select an operating day.
        </p>
      )}

      {/* Time slots */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Time
        </label>
        {datePart && isClosedDay ? (
          <p className="text-xs text-slate-400 py-2">
            Select an open day to see available times.
          </p>
        ) : datePart && timeSlots.length > 0 ? (
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
                  text={formatTime(slot)}
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
            value={value?.partySize ?? ""}
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
