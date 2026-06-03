"use client";

import LoadingPage from "@/components/ui/LoadingPage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/helper/formatDate";
import {
  PROMO_CARD_DAYS,
  PromoCardValidityUnit,
} from "@/lib/promoCard";
import {
  VOUCHER_VALIDITY_UNITS,
  VoucherValidityUnit,
} from "@/types/voucher.types";
import { BadgePercent, CreditCard, Hourglass, Users } from "lucide-react";
import { FormEvent } from "react";
import { getActivePromoCardSettings } from "./helpers/promoCardSettingsForm";
import { usePromoCardSettings } from "./hooks/usePromoCardSettings";
import { usePromoCards } from "./hooks/usePromoCards";
import type { PromoCardPurchaseStatus } from "./types/promo-card.type";

const statusStyles: Record<PromoCardPurchaseStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

type PromoCardsPageProps = {
  view?: "list" | "settings";
};

export default function PromoCardsContent({
  view = "list",
}: PromoCardsPageProps) {
  const {
    data: response,
    isLoading,
    error,
  } = usePromoCards();

  const activeConfig = getActivePromoCardSettings(response?.config);
  const {
    settingsForm,
    setSettingsForm,
    saveSettings,
    hasSettingsChanges,
    toggleRuleDay,
    submitSettings,
  } = usePromoCardSettings(response?.config);

  const handleSettingsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSettings();
  };

  if (isLoading) return <LoadingPage />;
  if (error) return <p>Error loading promo cards</p>;

  const purchases = response?.data ?? [];
  const stats = response?.stats ?? {
    total: 0,
    paid: 0,
    pending: 0,
    paidRevenue: 0,
  };
  const isSettingsView = view === "settings";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          {isSettingsView ? "Promo Card Settings" : "Promo Cards"}
        </h1>
        <p className="text-stone-500">
          {isSettingsView
            ? "Manage promo-card purchase amount, validity, usage behavior, discount days, and voucher rules."
            : "View authenticated customer promo-card purchases and payment status."}
        </p>
      </div>

      {isSettingsView && (
        <form
          onSubmit={handleSettingsSubmit}
          className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-5">
            <h2 className="text-xl font-bold text-stone-800">
              Promo Card Settings
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              These values are used for new promo-card purchases and future
              order discounts.
            </p>
          </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">
              Promo name
            </span>
            <input
              value={settingsForm.name}
              onChange={(event) =>
                setSettingsForm((current) => ({
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
              Purchase amount
            </span>
            <input
              type="number"
              min={1}
              step={0.01}
              value={settingsForm.purchasePrice}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  purchasePrice: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              required
            />
          </label>
        </div>

        <div className="mt-6">
          <div className="rounded-lg border border-stone-200 p-4">
            <div>
              <h3 className="text-sm font-bold text-stone-800">
                Validity
              </h3>
              <p className="text-xs text-stone-500">
                Set how long new promo cards stay valid.
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px]">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-stone-700">
                  Valid for
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={settingsForm.validityRule.duration}
                  onChange={(event) =>
                    setSettingsForm((current) => ({
                      ...current,
                      validityRule: {
                        ...current.validityRule,
                        duration: event.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-stone-700">
                  Unit
                </span>
                <select
                  value={settingsForm.validityRule.unit}
                  onChange={(event) =>
                    setSettingsForm((current) => ({
                      ...current,
                      validityRule: {
                        ...current.validityRule,
                        unit: event.target.value as PromoCardValidityUnit,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
                >
                  <option value="day">Day(s)</option>
                  <option value="month">Month(s)</option>
                  <option value="year">Year(s)</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-semibold text-stone-700">
                Fixed expiration date
              </span>
              <input
                type="date"
                value={settingsForm.validityRule.expiresAt}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    validityRule: {
                      ...current.validityRule,
                      expiresAt: event.target.value,
                    },
                  }))
                }
                className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              />
              <span className="block text-xs text-stone-400">
                Leave blank to calculate expiration from the purchase date.
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-stone-800">
                Discount Day Rules
              </h3>
              <p className="text-xs text-stone-500">
                Add up to 2 rules. A day can only belong to one rule.
              </p>
            </div>
            <button
              type="button"
              disabled={settingsForm.discountRules.length >= 2}
              onClick={() =>
                setSettingsForm((current) => ({
                  ...current,
                  discountRules: [
                    ...current.discountRules,
                    { days: [], discountPercent: "0" },
                  ],
                }))
              }
              className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-brand-color-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add discount
            </button>
          </div>

          {settingsForm.discountRules.map((rule, ruleIndex) => {
            const unavailableDays = settingsForm.discountRules
              .filter((_, index) => index !== ruleIndex)
              .flatMap((otherRule) => otherRule.days);

            return (
              <div
                key={ruleIndex}
                className="rounded-lg border border-stone-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-700">
                    Rule {ruleIndex + 1}
                  </p>
                  {settingsForm.discountRules.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm((current) => ({
                          ...current,
                          discountRules: current.discountRules.filter(
                            (_, index) => index !== ruleIndex,
                          ),
                        }))
                      }
                      className="text-xs font-semibold text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <div className="flex flex-wrap gap-2">
                    {PROMO_CARD_DAYS.map((day) => {
                      const isSelected = rule.days.includes(day);
                      const isUnavailable = unavailableDays.includes(day);

                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => toggleRuleDay(ruleIndex, day)}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                            isSelected
                              ? "border-brand-color-500 bg-brand-color-500 text-white"
                              : "border-stone-200 text-stone-600 hover:border-brand-color-500"
                          } disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-300`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={rule.discountPercent}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        discountRules: current.discountRules.map(
                          (currentRule, index) =>
                            index === ruleIndex
                              ? {
                                  ...currentRule,
                                  discountPercent: event.target.value,
                                }
                              : currentRule,
                        ),
                      }))
                    }
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
                    required
                    placeholder="Discount %"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border border-stone-200 p-4">
          <label className="flex w-fit items-center gap-3">
            <input
              type="checkbox"
              checked={settingsForm.voucherRule.enabled}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  voucherRule: {
                    ...current.voucherRule,
                    enabled: event.target.checked,
                  },
                }))
              }
              className="h-4 w-4 accent-brand-color-500"
            />
            <span className="text-sm font-bold text-stone-800">
              Enable voucher earning
            </span>
          </label>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-stone-700">
                Voucher amount
              </span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={settingsForm.voucherRule.voucherAmount}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    voucherRule: {
                      ...current.voucherRule,
                      voucherAmount: event.target.value,
                    },
                  }))
                }
                className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-stone-700">
                Minimum receipt amount
              </span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={settingsForm.voucherRule.minimumPurchase}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    voucherRule: {
                      ...current.voucherRule,
                      minimumPurchase: event.target.value,
                    },
                  }))
                }
                className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_160px]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-stone-700">
                Voucher valid for
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={settingsForm.voucherRule.validityRule.duration}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    voucherRule: {
                      ...current.voucherRule,
                      validityRule: {
                        ...current.voucherRule.validityRule,
                        duration: event.target.value,
                      },
                    },
                  }))
                }
                className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-stone-700">
                Unit
              </span>
              <select
                value={settingsForm.voucherRule.validityRule.unit}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    voucherRule: {
                      ...current.voucherRule,
                      validityRule: {
                        ...current.voucherRule.validityRule,
                        unit: event.target.value as VoucherValidityUnit,
                      },
                    },
                  }))
                }
                className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-color-500"
              >
                {VOUCHER_VALIDITY_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}(s)
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5">
            <div>
              <h3 className="text-sm font-bold text-stone-800">
                Voucher Usage
              </h3>
              <p className="text-xs text-stone-500">
                Choose how earned vouchers can be redeemed by customers.
              </p>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3">
                <input
                  type="radio"
                  name="voucher-usage"
                  checked={settingsForm.usageMode === "consumable"}
                  onChange={() =>
                    setSettingsForm((current) => ({
                      ...current,
                      usageMode: "consumable",
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-brand-color-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-stone-800">
                    Consumable
                  </span>
                  <span className="block text-xs text-stone-500">
                    Vouchers can be spent across multiple eligible orders.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3">
                <input
                  type="radio"
                  name="voucher-usage"
                  checked={settingsForm.usageMode === "oneTime"}
                  onChange={() =>
                    setSettingsForm((current) => ({
                      ...current,
                      usageMode: "oneTime",
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-brand-color-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-stone-800">
                    One-time use
                  </span>
                  <span className="block text-xs text-stone-500">
                    Vouchers should be consumed after one successful redemption.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-stone-400">
            Existing purchases keep their original amount and discount snapshot.
          </p>
          <button
            type="submit"
            disabled={saveSettings.isPending || !hasSettingsChanges}
            className="rounded-lg bg-brand-color-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#c13500] disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {saveSettings.isPending ? "Saving..." : "Save settings"}
          </button>
        </div>
        </form>
      )}

      {!isSettingsView && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-stone-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-color-500 text-white">
              <BadgePercent />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Requests</p>
              <p className="text-2xl font-bold text-stone-800">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <Users />
            </div>
            <div>
              <p className="text-sm text-stone-500">Paid Cards</p>
              <p className="text-2xl font-bold text-stone-800">
                {stats.paid}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Hourglass />
            </div>
            <div>
              <p className="text-sm text-stone-500">Pending</p>
              <p className="text-2xl font-bold text-stone-800">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <CreditCard />
            </div>
            <div>
              <p className="text-sm text-stone-500">Paid Revenue</p>
              <p className="text-2xl font-bold text-stone-800">
                ₱{stats.paidRevenue.toLocaleString("en-PH")}
              </p>
            </div>
          </div>
        </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-stone-500"
                  >
                    No promo card purchases yet.
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase._id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-stone-800">
                          {purchase.firstName} {purchase.lastName}
                        </p>
                        <p className="text-xs text-stone-500">
                          {purchase.customerEmail}
                        </p>
                        <p className="text-xs text-stone-500">
                          {purchase.customerPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {purchase.referenceNumber}
                    </TableCell>
                    <TableCell>
                      {(purchase.discountRate * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell>
                      ₱{purchase.purchasePrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[purchase.status]}`}
                      >
                        {purchase.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(purchase.createdAt, "--")}</TableCell>
                    <TableCell>{formatDate(purchase.paidAt, "--")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
          </div>
        </>
      )}

      {isSettingsView && (
        <p className="text-xs text-stone-400">
          Current rule: {activeConfig.name} has{" "}
          {activeConfig.discountRules.length} discount day rule
          {activeConfig.discountRules.length === 1 ? "" : "s"}.
        </p>
      )}
    </section>
  );
}
