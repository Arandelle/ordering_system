"use client";

import LoadingPage from "@/components/ui/LoadingPage";
import { apiClient } from "@/lib/apiClient";
import {
  DEFAULT_ORDER_DISCOUNT_PROMOTION,
  ORDER_DISCOUNT_DAYS,
  OrderDiscountDay,
  OrderDiscountDayMode,
  OrderDiscountPromotionConfig,
  OrderDiscountType,
} from "@/lib/orderDiscountPromotion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type OrderDiscountPromotionResponse = {
  config: OrderDiscountPromotionConfig & {
    _id?: string;
    startsAt?: string | Date | null;
    endsAt?: string | Date | null;
    updatedAt?: string;
  };
};

type OrderDiscountPromotionForm = {
  enabled: boolean;
  name: string;
  discountType: OrderDiscountType;
  discountValue: string;
  maximumDiscountAmount: string;
  minimumOrderAmount: string;
  startsAt: string;
  endsAt: string;
  dayMode: OrderDiscountDayMode;
  days: OrderDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions: string;
};

function formatCurrency(value: number) {
  return `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateInputValue(value?: string | Date | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function buildInitialForm(
  config: OrderDiscountPromotionResponse["config"],
): OrderDiscountPromotionForm {
  return {
    enabled: config.enabled,
    name: config.name,
    discountType: config.discountType,
    discountValue: String(config.discountValue),
    maximumDiscountAmount:
      config.maximumDiscountAmount === null ||
      config.maximumDiscountAmount === undefined
        ? ""
        : String(config.maximumDiscountAmount),
    minimumOrderAmount: String(config.minimumOrderAmount),
    startsAt: formatDateInputValue(config.startsAt),
    endsAt: formatDateInputValue(config.endsAt),
    dayMode: config.dayMode,
    days: config.days,
    startTime: config.startTime,
    endTime: config.endTime,
    maximumRedemptions:
      config.maximumRedemptions === null ||
      config.maximumRedemptions === undefined
        ? ""
        : String(config.maximumRedemptions),
  };
}

function getPreviewLines(form: OrderDiscountPromotionForm) {
  const discountValue = Number(form.discountValue || 0);
  const minimumOrderAmount = Number(form.minimumOrderAmount || 0);
  const maxDiscount = Number(form.maximumDiscountAmount || 0);
  const maxRedemptions = Number(form.maximumRedemptions || 0);
  const discountLine =
    form.discountType === "percentage"
      ? `${discountValue}% off whole order${
          maxDiscount > 0
            ? `, capped at ${formatCurrency(maxDiscount)}`
            : ", no maximum cap"
        }`
      : `${formatCurrency(discountValue)} off whole order`;
  const daysLine =
    form.dayMode === "opening_days"
      ? "Every opening day"
      : form.days.length
        ? form.days.join(", ")
        : "No specific days selected";
  const periodLine = `${form.startsAt || "No start date"} to ${
    form.endsAt || "no end date"
  }`;

  return [
    form.enabled ? "Promotion is active" : "Promotion is disabled",
    discountLine,
    `Minimum order: ${formatCurrency(minimumOrderAmount)}`,
    `Period: ${periodLine}`,
    `Days: ${daysLine}`,
    `Time: ${form.startTime} to ${form.endTime}`,
    maxRedemptions > 0
      ? `Maximum redemptions: ${maxRedemptions}`
      : "Maximum redemptions: no limit",
  ];
}

function OrderDiscountPromotionForm({
  initialConfig,
}: {
  initialConfig: OrderDiscountPromotionResponse["config"];
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<OrderDiscountPromotionForm>(() =>
    buildInitialForm(initialConfig),
  );
  const initialForm = useMemo(
    () => buildInitialForm(initialConfig),
    [initialConfig],
  );
  const previewLines = getPreviewLines(form);
  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
  const showPercentageCap = form.discountType === "percentage";

  const savePromotion = useMutation({
    mutationFn: (payload: {
      enabled: boolean;
      name: string;
      discountType: OrderDiscountType;
      discountValue: number;
      maximumDiscountAmount: number | null;
      minimumOrderAmount: number;
      startsAt: string | null;
      endsAt: string | null;
      dayMode: OrderDiscountDayMode;
      days: OrderDiscountDay[];
      startTime: string;
      endTime: string;
      maximumRedemptions: number | null;
    }) =>
      apiClient.patch<OrderDiscountPromotionResponse>(
        "/admin/order-discount-promotions",
        payload,
      ),
    onSuccess: async () => {
      toast.success("Order discount promotion updated.");
      await queryClient.invalidateQueries({
        queryKey: ["admin", "order-discount-promotions"],
      });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Failed to update order discount promotion.");
    },
  });

  const toggleDay = (day: OrderDiscountDay) => {
    setForm((current) => {
      const hasDay = current.days.includes(day);

      return {
        ...current,
        days: hasDay
          ? current.days.filter((candidate) => candidate !== day)
          : [...current.days, day],
      };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    savePromotion.mutate({
      enabled: form.enabled,
      name: form.name,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maximumDiscountAmount:
        form.discountType === "percentage" && form.maximumDiscountAmount
          ? Number(form.maximumDiscountAmount)
          : null,
      minimumOrderAmount: Number(form.minimumOrderAmount || 0),
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      dayMode: form.dayMode,
      days: form.dayMode === "specific_days" ? form.days : [],
      startTime: form.startTime,
      endTime: form.endTime,
      maximumRedemptions: form.maximumRedemptions
        ? Number(form.maximumRedemptions)
        : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-800">
              Whole Order Discount
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Configure one whole-order discount customers can receive during
              the selected schedule.
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-stone-700">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  enabled: event.target.checked,
                }))
              }
              className="h-4 w-4 accent-brand-color-500"
            />
            Enabled
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">
              Promotion name
            </span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">
              Discount type
            </span>
            <select
              value={form.discountType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  discountType: event.target.value as OrderDiscountType,
                  maximumDiscountAmount:
                    event.target.value === "percentage"
                      ? current.maximumDiscountAmount
                      : "",
                }))
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">
              {form.discountType === "percentage"
                ? "Discount percentage"
                : "Discount amount"}
            </span>
            <input
              type="number"
              min={0.01}
              max={form.discountType === "percentage" ? 100 : undefined}
              step={0.01}
              value={form.discountValue}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  discountValue: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              required
            />
          </label>

          {showPercentageCap && (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-stone-700">
                Maximum discount amount
              </span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.maximumDiscountAmount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    maximumDiscountAmount: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
                placeholder="No limit"
              />
            </label>
          )}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">
              Minimum order amount
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.minimumOrderAmount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  minimumOrderAmount: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              required
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-stone-800">
            Promotion Period
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Set when this discount is visible and eligible.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">
              Start date
            </span>
            <input
              type="date"
              value={form.startsAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  startsAt: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">
              End date
            </span>
            <input
              type="date"
              value={form.endsAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  endsAt: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">
              Start time
            </span>
            <input
              type="time"
              value={form.startTime}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  startTime: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">
              End time
            </span>
            <input
              type="time"
              value={form.endTime}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  endTime: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              required
            />
          </label>
        </div>

        <div className="mt-5">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3">
              <input
                type="radio"
                name="day-mode"
                checked={form.dayMode === "opening_days"}
                onChange={() =>
                  setForm((current) => ({
                    ...current,
                    dayMode: "opening_days",
                  }))
                }
                className="mt-1 h-4 w-4 accent-brand-color-500"
              />
              <span>
                <span className="block text-sm font-semibold text-stone-800">
                  Every opening day
                </span>
                <span className="block text-xs text-stone-500">
                  Use the store schedule later when checkout eligibility is
                  connected.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3">
              <input
                type="radio"
                name="day-mode"
                checked={form.dayMode === "specific_days"}
                onChange={() =>
                  setForm((current) => ({
                    ...current,
                    dayMode: "specific_days",
                  }))
                }
                className="mt-1 h-4 w-4 accent-brand-color-500"
              />
              <span>
                <span className="block text-sm font-semibold text-stone-800">
                  Specific days
                </span>
                <span className="block text-xs text-stone-500">
                  Choose one or more weekdays.
                </span>
              </span>
            </label>
          </div>

          {form.dayMode === "specific_days" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {ORDER_DISCOUNT_DAYS.map((day) => {
                const isSelected = form.days.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "border-brand-color-500 bg-brand-color-500 text-white"
                        : "border-stone-200 text-stone-600 hover:border-brand-color-500"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <label className="mt-5 block space-y-2">
          <span className="text-sm font-semibold text-stone-700">
            Maximum redemptions
          </span>
          <input
            type="number"
            min={1}
            step={1}
            value={form.maximumRedemptions}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                maximumRedemptions: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
            placeholder="No limit"
          />
        </label>
      </div>

      <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-stone-800">Preview</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {previewLines.map((line) => (
            <div
              key={line}
              className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700"
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-stone-400">
          This saves the promotion configuration only. Checkout application is a
          separate backend pricing step.
        </p>
        <button
          type="submit"
          disabled={savePromotion.isPending || !hasChanges}
          className="rounded-lg bg-brand-color-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#c13500] disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {savePromotion.isPending ? "Saving..." : "Save promotion"}
        </button>
      </div>
    </form>
  );
}

export default function OrderDiscountPromotionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "order-discount-promotions"],
    queryFn: () =>
      apiClient.get<OrderDiscountPromotionResponse>(
        "/admin/order-discount-promotions",
      ),
  });
  const initialConfig = data?.config ?? DEFAULT_ORDER_DISCOUNT_PROMOTION;
  const formKey = JSON.stringify(initialConfig);

  if (isLoading) return <LoadingPage />;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-stone-800">
          Order Discounts
        </h1>
        <p className="text-stone-500">
          Create a whole-order discount with schedule, minimum order, caps, and
          redemption limits.
        </p>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600">
          Failed to load order discount promotion.
        </p>
      ) : (
        <OrderDiscountPromotionForm
          key={formKey}
          initialConfig={initialConfig}
        />
      )}
    </section>
  );
}
