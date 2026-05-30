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
import { apiClient } from "@/lib/apiClient";
import {
  DEFAULT_PROMO_CARD_DISCOUNT_RULES,
  DEFAULT_PROMO_CARD_VOUCHER_RULE,
  PROMO_CARD,
  PROMO_CARD_DAYS,
  PromoCardDay,
} from "@/lib/promoCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgePercent, CreditCard, Hourglass, Users } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type PromoCardPurchaseStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

type PromoCardPurchase = {
  _id: string;
  referenceNumber: string;
  status: PromoCardPurchaseStatus;
  paymentStatus?: string;
  firstName: string;
  lastName: string;
  customerEmail: string;
  customerPhone: string;
  purchasePrice: number;
  discountRate: number;
  createdAt: string;
  paidAt?: string;
};

type PromoCardResponse = {
  data: PromoCardPurchase[];
  config: PromoCardSettings;
  stats: {
    total: number;
    paid: number;
    pending: number;
    paidRevenue: number;
  };
};

type PromoCardSettings = {
  name: string;
  discountRate: number;
  purchasePrice: number;
  sku: string;
  discountRules: {
    days: PromoCardDay[];
    discountRate: number;
  }[];
  voucherRule: {
    enabled: boolean;
    voucherAmount: number;
    minimumPurchase: number;
  };
};

type PromoCardSettingsForm = {
  name: string;
  purchasePrice: string;
  discountRules: {
    days: PromoCardDay[];
    discountPercent: string;
  }[];
  voucherRule: {
    enabled: boolean;
    voucherAmount: string;
    minimumPurchase: string;
  };
};

const statusStyles: Record<PromoCardPurchaseStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

function formatDate(value?: string) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PromoCardsPage() {
  const queryClient = useQueryClient();
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "promo-cards"],
    queryFn: () => apiClient.get<PromoCardResponse>("/admin/promo-cards"),
  });
  const [settingsForm, setSettingsForm] = useState<PromoCardSettingsForm>({
    name: PROMO_CARD.name,
    purchasePrice: String(PROMO_CARD.purchasePrice),
    discountRules: DEFAULT_PROMO_CARD_DISCOUNT_RULES.map((rule) => ({
      days: rule.days,
      discountPercent: String(rule.discountRate * 100),
    })),
    voucherRule: {
      enabled: DEFAULT_PROMO_CARD_VOUCHER_RULE.enabled,
      voucherAmount: String(DEFAULT_PROMO_CARD_VOUCHER_RULE.voucherAmount),
      minimumPurchase: String(DEFAULT_PROMO_CARD_VOUCHER_RULE.minimumPurchase),
    },
  });

  useEffect(() => {
    if (!response?.config) return;

    setSettingsForm({
      name: response.config.name,
      purchasePrice: String(response.config.purchasePrice),
      discountRules: response.config.discountRules.map((rule) => ({
        days: rule.days,
        discountPercent: String(rule.discountRate * 100),
      })),
      voucherRule: {
        enabled: response.config.voucherRule.enabled,
        voucherAmount: String(response.config.voucherRule.voucherAmount),
        minimumPurchase: String(response.config.voucherRule.minimumPurchase),
      },
    });
  }, [response?.config]);

  const saveSettings = useMutation({
    mutationFn: (payload: {
      name: string;
      purchasePrice: number;
      discountRules: {
        days: PromoCardDay[];
        discountPercent: number;
      }[];
      voucherRule: {
        enabled: boolean;
        voucherAmount: number;
        minimumPurchase: number;
      };
    }) => apiClient.patch<{ config: PromoCardSettings }>("/admin/promo-cards", payload),
    onSuccess: async () => {
      toast.success("Promo card settings updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "promo-cards"] });
      await queryClient.invalidateQueries({
        queryKey: ["customer", "promo-card", "status"],
      });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Failed to update promo card settings.");
    },
  });

  const handleSettingsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    saveSettings.mutate({
      name: settingsForm.name,
      purchasePrice: Number(settingsForm.purchasePrice),
      discountRules: settingsForm.discountRules.map((rule) => ({
        days: rule.days,
        discountPercent: Number(rule.discountPercent),
      })),
      voucherRule: {
        enabled: settingsForm.voucherRule.enabled,
        voucherAmount: Number(settingsForm.voucherRule.voucherAmount),
        minimumPurchase: Number(settingsForm.voucherRule.minimumPurchase),
      },
    });
  };

  if (isLoading) return <LoadingPage />;
  if (error) return <p>Error loading promo card purchases</p>;

  const purchases = response?.data ?? [];
  const stats = response?.stats ?? {
    total: 0,
    paid: 0,
    pending: 0,
    paidRevenue: 0,
  };
  const activeConfig = response?.config ?? {
    ...PROMO_CARD,
    discountRules: DEFAULT_PROMO_CARD_DISCOUNT_RULES,
    voucherRule: DEFAULT_PROMO_CARD_VOUCHER_RULE,
  };
  const hasSettingsChanges =
    JSON.stringify(settingsForm) !==
    JSON.stringify({
      name: activeConfig.name,
      purchasePrice: String(activeConfig.purchasePrice),
      discountRules: activeConfig.discountRules.map((rule) => ({
        days: rule.days,
        discountPercent: String(rule.discountRate * 100),
      })),
      voucherRule: {
        enabled: activeConfig.voucherRule.enabled,
        voucherAmount: String(activeConfig.voucherRule.voucherAmount),
        minimumPurchase: String(activeConfig.voucherRule.minimumPurchase),
      },
    });

  const toggleRuleDay = (ruleIndex: number, day: PromoCardDay) => {
    setSettingsForm((current) => ({
      ...current,
      discountRules: current.discountRules.map((rule, index) => {
        if (index !== ruleIndex) return rule;

        const hasDay = rule.days.includes(day);
        return {
          ...rule,
          days: hasDay
            ? rule.days.filter((value) => value !== day)
            : [...rule.days, day],
        };
      }),
    }));
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          Promo Cards
        </h1>
        <p className="text-stone-500">
          View authenticated customer promo-card purchases and payment status.
        </p>
      </div>

      <form
        onSubmit={handleSettingsSubmit}
        className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-xl font-bold text-stone-800">
            Promo Card Settings
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            These values are used for new promo-card purchases and future order
            discounts.
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
                    <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                    <TableCell>{formatDate(purchase.paidAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-stone-400">
        Current rule: {activeConfig.name} has{" "}
        {activeConfig.discountRules.length} discount day rule
        {activeConfig.discountRules.length === 1 ? "" : "s"}.
      </p>
    </section>
  );
}
