import React, { FormEvent } from "react";
import { usePromoCardSettings } from "../../hooks/usePromoCardSettings";
import { usePromoCards } from "../../hooks/usePromoCards";
import { InputField } from "@/components/ui/FormComponents/InputField";
import { SelectField } from "@/components/ui/FormComponents/SelectField";
import { PROMO_CARD_DAYS, PromoCardValidityUnit } from "@/lib/promoCard";
import {
  VOUCHER_VALIDITY_UNITS,
  VoucherValidityUnit,
} from "@/types/voucher.types";
import { getActivePromoCardSettings } from "../../helpers/promoCardSettingsForm";
import SectionHeader from "@/app/admin/components/SectionHeader";
import LoadingPage from "@/components/ui/LoadingPage";
import { Checkbox } from "@/components/ui/FormComponents";
import { IconButton } from "@/components/ui/buttons";

const PromoCardSettings = () => {
  const { data: response, isLoading, error } = usePromoCards();
  const {
    settingsForm,
    setSettingsForm,
    saveSettings,
    hasSettingsChanges,
    toggleRuleDay,
    submitSettings,
  } = usePromoCardSettings(response?.config);

  const activeConfig = getActivePromoCardSettings(response?.config);

  const handleSettingsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSettings();
  };

  if (isLoading) return <LoadingPage />;
  if (error) return <p>Error loading promo cards</p>;

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Promo Card Settings"
        subTitle="Manage promo-card purchase amount, validity, usage behavior, discount days, and voucher rules."
      />

      <form
        onSubmit={handleSettingsSubmit}
        className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm"
      >
        {!settingsForm.enabled && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-red-900">
                  Not Ready for Publishing
                </h3>
                <p className="mt-1 text-xs leading-5 text-red-800">
                  This promotion is currently disabled. Discuss it to the
                  marketing
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InputField
            label="Promo name"
            value={settingsForm.name}
            onChange={(event) =>
              setSettingsForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />
          <InputField
            label="Purchase amount"
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
            required
          />
          <div className="place-content-center">
            <Checkbox
              type="checkbox"
              checked={settingsForm.enabled}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  enabled: event.target.checked,
                }))
              }
              disabled
              label={settingsForm.enabled ? "Available" : "Unavailable"}
            />
          </div>
        </div>
        <div className="mt-6">
          <div className="rounded-lg border border-stone-200 p-4">
            <div>
              <h3 className="text-sm font-bold text-stone-800">Validity</h3>
              <p className="text-xs text-stone-500">
                Set how long new promo cards stay valid.
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px]">
              <InputField
                label="Valid for"
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
                required
              />
              <SelectField
                label="Unit"
                options={[
                  {
                    value: "day",
                    label: "Day(s)",
                  },
                  {
                    value: "month",
                    label: "Month(s)",
                  },
                  {
                    value: "year",
                    label: "Year(s)",
                  },
                ]}
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
              />
            </div>
            <div className="mt-4 space-y-2">
              <InputField
                label="Fixed expiration date"
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
              />
              <span className="block text-xs text-stone-400">
                Leave blank to calculate expiration from the purchase date.
              </span>
            </div>
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
            <IconButton
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
              text="Add discount"
              className="rounded-lg px-4"
            />
          </div>
          <div
            className={`${settingsForm.discountRules.length > 1 && "grid xl:grid-cols-2 gap-4"}`}
          >
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
                      <IconButton
                        type="button"
                        onClick={() =>
                          setSettingsForm((current) => ({
                            ...current,
                            discountRules: current.discountRules.filter(
                              (_, index) => index !== ruleIndex,
                            ),
                          }))
                        }
                        variant="danger"
                        text="Remove"
                        className="text-xs font-semibold rounded-lg"
                      />
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                    <div className="flex flex-wrap gap-2 items-end">
                      {PROMO_CARD_DAYS.map((day) => {
                        const isSelected = rule.days.includes(day);
                        const isUnavailable = unavailableDays.includes(day);
                        return (
                          <IconButton
                            key={day}
                            type="button"
                            disabled={isUnavailable}
                            onClick={() => toggleRuleDay(ruleIndex, day)}
                            variant={isSelected ? "primary" : "secondary"}
                            text={day}
                            className="text-xs font-semibold rounded-lg"
                          />
                        );
                      })}
                    </div>
                    <InputField
                      label="Discount Percent %"
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
                      required
                      placeholder="Discount %"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-6 rounded-lg border border-stone-200 p-4">
          <Checkbox
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
            disabled
            label="Enable voucher earning"
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InputField
              label="Voucher amount"
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
            />
            <InputField
              label="Minimum receipt amount"
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
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_160px]">
            <InputField
              label="Voucher valid for"
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
            />
            <SelectField
              label="Unit"
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
              options={VOUCHER_VALIDITY_UNITS.map((unit) => ({
                value: unit,
                label: unit.charAt(0).toUpperCase() + unit.slice(1) + "(s)",
              }))}
            />
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
          <IconButton
            type="submit"
            // disabled={saveSettings.isPending || !hasSettingsChanges}
            disabled
            text={saveSettings.isPending ? "Saving..." : "Save settings"}
          />
        </div>
      </form>

      <p className="text-xs text-stone-400">
        Current rule: {activeConfig.name} has{" "}
        {activeConfig.discountRules.length} discount day rule
        {activeConfig.discountRules.length === 1 ? "" : "s"}.
      </p>
    </section>
  );
};

export default PromoCardSettings;
