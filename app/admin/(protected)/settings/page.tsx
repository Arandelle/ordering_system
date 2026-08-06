"use client";

import { InputField } from "@/components/ui/FormComponents/InputField";
import { SelectField } from "@/components/ui/FormComponents/SelectField";
import React, { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SectionHeader from "../../components/SectionHeader";
import {
  useSettings,
  useSaveSettings,
  type Days,
  type SettingsType,
} from "@/hooks/api/useSettings";
import LoadingPage from "@/components/ui/LoadingPage";
import { TextareaField } from "@/components/ui/FormComponents/TextAreaField";
import { formatTime, formatDays } from "@/helper/formatter/";
import { Checkbox } from "@/components/ui/FormComponents";
import { IconButton } from "@/components/ui/buttons";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { fetchNcrCities } from "@/lib/psgcAddress";

type Action =
  | { type: "SET_STORE_NAME"; value: string }
  | { type: "SET_ADDRESS"; value: string }
  | {
      type: "SET_CONTACT_FIELD";
      field: "phone" | "email" | "viber";
      value: string;
    }
  | { type: "TOGGLE_DAY"; day: Days }
  | { type: "SET_HOURS_FIELD"; field: "openTime" | "closeTime"; value: string }
  | { type: "SET_IS_CLOSED"; value: boolean }
  | { type: "SET_GLOBAL_MAX_ACTIVE_ORDERS"; value: number | null }
  | { type: "SET_IS_GLOBAL_CAPACITY_SHARED"; value: boolean }
  | { type: "SET_GLOBAL_MAX_RESERVATIONS_PER_HOUR"; value: number | null }
  | { type: "SET_GLOBAL_MAX_RESERVATIONS_PER_DAY"; value: number | null }
  | { type: "SET_FREE_DELIVERY_ENABLED"; value: boolean }
  | { type: "SET_FREE_DELIVERY_MINIMUM_PURCHASE"; value: number }
  | { type: "SET_FREE_DELIVERY_MAX_DISTANCE_KM"; value: number }
  | { type: "SET_COD_ENABLED"; value: boolean }
  | { type: "ADD_DELIVERY_AREA"; cityCode: string; cityName: string }
  | { type: "REMOVE_DELIVERY_AREA"; cityCode: string }
  | { type: "LOAD_SETTINGS"; payload: SettingsType }
  | { type: "RESET" };

const DEFAULT_STATE: SettingsType = {
  storeName: "",
  address: "",
  contact: { phone: "", email: "", viber: "" },
  operatingHours: {
    days: [],
    openTime: "",
    closeTime: "",
    isClosed: false,
  },
  globalMaxActiveOrders: null,
  isGlobalCapacityShared: false,
  globalMaxReservationsPerHour: null,
  globalMaxReservationsPerDay: null,
  freeDeliveryEnabled: false,
  freeDeliveryMinimumPurchase: 549,
  freeDeliveryMaxDistanceKm: 5,
  codEnabled: false,
  deliveryAreas: [],
};

function settingsReducer(state: SettingsType, action: Action): SettingsType {
  switch (action.type) {
    case "SET_STORE_NAME":
      return { ...state, storeName: action.value };

    case "SET_ADDRESS":
      return { ...state, address: action.value };

    case "SET_CONTACT_FIELD":
      return {
        ...state,
        contact: { ...state.contact, [action.field]: action.value },
      };

    case "TOGGLE_DAY": {
      const exists = state.operatingHours.days.includes(action.day);
      return {
        ...state,
        operatingHours: {
          ...state.operatingHours,
          days: exists
            ? state.operatingHours.days.filter((d) => d !== action.day)
            : [...state.operatingHours.days, action.day],
        },
      };
    }

    case "SET_HOURS_FIELD":
      return {
        ...state,
        operatingHours: {
          ...state.operatingHours,
          [action.field]: action.value,
        },
      };

    case "SET_IS_CLOSED":
      return {
        ...state,
        operatingHours: {
          ...state.operatingHours,
          isClosed: action.value,
        },
      };

    case "SET_GLOBAL_MAX_ACTIVE_ORDERS":
      return { ...state, globalMaxActiveOrders: action.value };

    case "SET_IS_GLOBAL_CAPACITY_SHARED":
      return { ...state, isGlobalCapacityShared: action.value };

    case "SET_GLOBAL_MAX_RESERVATIONS_PER_HOUR":
      return { ...state, globalMaxReservationsPerHour: action.value };

    case "SET_GLOBAL_MAX_RESERVATIONS_PER_DAY":
      return { ...state, globalMaxReservationsPerDay: action.value };

    case "SET_FREE_DELIVERY_ENABLED":
      return { ...state, freeDeliveryEnabled: action.value };

    case "SET_FREE_DELIVERY_MINIMUM_PURCHASE":
      return { ...state, freeDeliveryMinimumPurchase: action.value };

    case "SET_FREE_DELIVERY_MAX_DISTANCE_KM":
      return { ...state, freeDeliveryMaxDistanceKm: action.value };

    case "SET_COD_ENABLED":
      return { ...state, codEnabled: action.value };

    case "ADD_DELIVERY_AREA": {
      // Prevent duplicates by cityCode
      if (state.deliveryAreas.some((a) => a.cityCode === action.cityCode)) {
        return state;
      }
      return {
        ...state,
        deliveryAreas: [
          ...state.deliveryAreas,
          { cityCode: action.cityCode, cityName: action.cityName },
        ],
      };
    }

    case "REMOVE_DELIVERY_AREA":
      return {
        ...state,
        deliveryAreas: state.deliveryAreas.filter(
          (a) => a.cityCode !== action.cityCode,
        ),
      };

    case "LOAD_SETTINGS":
      return action.payload;

    case "RESET":
      return DEFAULT_STATE;

    default:
      return state;
  }
}

export const DAYS: Days[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function normalizeForCompare(s: SettingsType) {
  return {
    ...s,
    operatingHours: {
      ...s.operatingHours,
      days: [...s.operatingHours.days].sort(),
    },
  };
}

const SettingsPage = () => {
  const { data: savedSettings, isLoading } = useSettings();
  const { mutate: saveSettings, isPending } = useSaveSettings();
  const [settings, dispatch] = useReducer(settingsReducer, DEFAULT_STATE);
  const [selectedAreaCityCode, setSelectedAreaCityCode] = useState("");

  // PSGC: NCR cities for delivery area selector
  const { data: ncrCities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ["psgc", "ncr-cities"],
    queryFn: fetchNcrCities,
    staleTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (savedSettings) {
      dispatch({ type: "LOAD_SETTINGS", payload: savedSettings });
    }
  }, [savedSettings]);

  const hasChanges =
    JSON.stringify(normalizeForCompare(settings)) !==
    JSON.stringify(normalizeForCompare(savedSettings ?? DEFAULT_STATE));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
  };

  const handleReset = () => {
    if (savedSettings) {
      dispatch({ type: "LOAD_SETTINGS", payload: savedSettings });
    } else {
      dispatch({ type: "RESET" });
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <SectionHeader
          title="System Settings"
          subTitle="Manage your system settings"
        />
        <LoadingPage />
      </section>
    );
  }

  const { days, openTime, closeTime, isClosed } = settings.operatingHours;

  const sharedFieldClass = `
    transition-all duration-200
    bg-white
    border border-gray-200
    hover:border-brand-color-300
    focus-within:border-brand-color-500
    focus-within:ring-2 focus-within:ring-brand-color-100
    
  `;

  const sharedReadonlyClass = !hasChanges
    ? "bg-gray-50 text-stone-500"
    : "bg-white text-stone-900";

  const fieldClassName = `${sharedFieldClass} ${sharedReadonlyClass}`;

  return (
    <section className="">
      <div className="sticky flex items-center justify-between top-20 z-50 bg-white">
        <div className="pt-2">
          <SectionHeader
            title="System Settings"
            subTitle="Manage your system settings"
          />
        </div>
        <div className="flex gap-4 py-3">
          <IconButton
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
            text="Reset"
            className="px-4"
          />
          <IconButton
            type="submit"
            form="settings-form"
            disabled={!hasChanges}
            text={isPending ? "Saving…" : "Save Changes"}
            className="px-4"
          />
        </div>
      </div>

      <form
        id="settings-form"
        onSubmit={handleSubmit}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/**  Store Information */}
        <>
          <h2 className="text-xl font-bold text-stone-800">
            Store Information
          </h2>
          <div className="p-6 border border-gray-200 space-y-4">
            <InputField
              label="Store Name"
              id="store-name"
              type="text"
              value={settings.storeName ?? ""}
              onChange={(e) =>
                dispatch({ type: "SET_STORE_NAME", value: e.target.value })
              }
              required
              className={fieldClassName}
            />
            <div className="border-b border-b-gray-200 pb-4">
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Address
              </label>
              <TextareaField
                value={settings.address}
                onChange={(e) =>
                  dispatch({ type: "SET_ADDRESS", value: e.target.value })
                }
                rows={3}
                required
                className={fieldClassName}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Contact Number"
                id="contact-number"
                value={settings.contact.phone}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CONTACT_FIELD",
                    field: "phone",
                    value: e.target.value,
                  })
                }
                required
                className={fieldClassName}
              />
              <InputField
                label="Email Address"
                id="email-address"
                type="email"
                value={settings.contact.email}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CONTACT_FIELD",
                    field: "email",
                    value: e.target.value,
                  })
                }
                required
                className={fieldClassName}
              />
            </div>
            <InputField
              label="Viber Number"
              id="viber-number"
              value={settings.contact.viber}
              onChange={(e) =>
                dispatch({
                  type: "SET_CONTACT_FIELD",
                  field: "viber",
                  value: e.target.value,
                })
              }
              required
              className={fieldClassName}
            />
          </div>
        </>
        {/** Business Hours */}
        <>
          <h2 className="text-xl font-bold text-stone-800">Business Hours</h2>
          <div className="p-6 border border-gray-200 space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-stone-700">Open Days</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const isActive = days.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => dispatch({ type: "TOGGLE_DAY", day })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                        isActive
                          ? "bg-brand-color-500 text-white border-brand-color-500"
                          : "border-gray-200 text-stone-600 hover:border-brand-color-300 hover:bg-gray-50"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-stone-400">
                Click to toggle. Selected days share the same opening and
                closing times.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Opening Time"
                id="opening-time"
                type="time"
                value={openTime ?? ""}
                disabled={isClosed}
                onChange={(e) =>
                  dispatch({
                    type: "SET_HOURS_FIELD",
                    field: "openTime",
                    value: e.target.value,
                  })
                }
                className={fieldClassName}
              />
              <InputField
                label="Closing Time"
                id="closing-time"
                type="time"
                value={closeTime ?? ""}
                disabled={isClosed}
                onChange={(e) =>
                  dispatch({
                    type: "SET_HOURS_FIELD",
                    field: "closeTime",
                    value: e.target.value,
                  })
                }
                className={fieldClassName}
              />
            </div>
            <Checkbox
              label=" Mark store as temporarily closed"
              checked={isClosed}
              onChange={(e) =>
                dispatch({ type: "SET_IS_CLOSED", value: e.target.checked })
              }
            />
            <div className="p-4 bg-gray-50  border border-gray-100 space-y-1">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Preview
              </p>
              {isClosed ? (
                <p className="text-sm font-semibold text-red-500">
                  Store is temporarily closed
                </p>
              ) : (
                <p className="text-sm text-stone-700">
                  <span className="font-semibold">{formatDays(days)}</span>
                  {days.length > 0 && openTime && closeTime && (
                    <span className="text-stone-500">
                      {" "}
                      · {formatTime(openTime)} – {formatTime(closeTime)}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </>
        {/** Global Order Capacity */}
        <>
          <h2 className="text-xl font-bold text-stone-800">Order Capacity</h2>
          <div className="p-6 border border-gray-200 space-y-4">
            <p className="text-sm text-stone-600">
              Set the global default for how many active orders a branch can
              handle simultaneously. Branches can override this with their own
              limit.
            </p>
            <InputField
              label="Global Max Active Orders"
              id="global-max-active-orders"
              type="number"
              value={
                settings.globalMaxActiveOrders === null
                  ? ""
                  : String(settings.globalMaxActiveOrders)
              }
              onChange={(e) => {
                const val = e.target.value;
                dispatch({
                  type: "SET_GLOBAL_MAX_ACTIVE_ORDERS",
                  value: val === "" ? null : Math.max(1, parseInt(val) || 1),
                });
              }}
              placeholder="Leave empty for no limit"
              className={fieldClassName}
            />
            <Checkbox
              label="Shared capacity across all branches"
              subLabel="When enabled, all branches share one global pool on accepting orders."
              checked={settings.isGlobalCapacityShared}
              onChange={(e) =>
                dispatch({
                  type: "SET_IS_GLOBAL_CAPACITY_SHARED",
                  value: e.target.checked,
                })
              }
            />
            <p className="text-xs text-stone-400">
              Active orders include: pending, preparing, dispatched, and ready
              for pickup. When a branch reaches this limit, new orders are
              blocked until an active order completes.
            </p>
          </div>
        </>
        {/** Reservation capacity */}
        <>
          <h2 className="text-xl font-bold text-stone-800">
            Reservation Capacity
          </h2>
          <div className="p-6 border border-gray-200 space-y-4">
            <p className="text-sm text-stone-600">
              Set the global default for how many dine-in reservations a branch
              can accept. Branches can override these with their own limits.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Max Reservations Per Hour"
                id="global-max-reservations-per-hour"
                type="number"
                value={
                  settings.globalMaxReservationsPerHour === null
                    ? ""
                    : String(settings.globalMaxReservationsPerHour)
                }
                onChange={(e) => {
                  const val = e.target.value;
                  dispatch({
                    type: "SET_GLOBAL_MAX_RESERVATIONS_PER_HOUR",
                    value: val === "" ? null : Math.max(1, parseInt(val) || 1),
                  });
                }}
                placeholder="Leave empty for no limit"
                className={fieldClassName}
              />
              <InputField
                label="Max Reservations Per Day"
                id="global-max-reservations-per-day"
                type="number"
                value={
                  settings.globalMaxReservationsPerDay === null
                    ? ""
                    : String(settings.globalMaxReservationsPerDay)
                }
                onChange={(e) => {
                  const val = e.target.value;
                  dispatch({
                    type: "SET_GLOBAL_MAX_RESERVATIONS_PER_DAY",
                    value: val === "" ? null : Math.max(1, parseInt(val) || 1),
                  });
                }}
                placeholder="Leave empty for no limit"
                className={fieldClassName}
              />
            </div>
            <p className="text-xs text-stone-400">
              Counted reservations include: pending payment, pending, confirmed,
              preparing, and ready for pickup. Cancelled and completed
              reservations free up slots automatically.
            </p>
          </div>
        </>
        {/** Delivery Areas */}
        <>
          <h2 className="text-xl font-bold text-stone-800">Delivery Areas</h2>
          <div className="p-6 border border-gray-200 space-y-4">
            <p className="text-sm text-stone-600">
              Configure which cities are available for delivery. Only customers
              in these cities can place delivery orders. Leave empty to allow
              all cities.
            </p>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SelectField
                  label="Add City"
                  value={selectedAreaCityCode}
                  onChange={(e) => setSelectedAreaCityCode(e.target.value)}
                  disabled={isLoadingCities}
                  options={[
                    {
                      value: "",
                      label: isLoadingCities
                        ? "Loading cities..."
                        : "Select a city to add",
                      disabled: true,
                    },
                    ...ncrCities
                      .filter(
                        (city) =>
                          !settings.deliveryAreas.some(
                            (a) => a.cityCode === city.code,
                          ),
                      )
                      .map((city) => ({
                        value: city.code,
                        label: city.name,
                      })),
                  ]}
                  leftIcon={<DynamicIcon name="Building2" size={15} />}
                  className="text-sm"
                />
              </div>
              <IconButton
                onClick={() => {
                  const city = ncrCities.find(
                    (c) => c.code === selectedAreaCityCode,
                  );
                  if (city) {
                    dispatch({
                      type: "ADD_DELIVERY_AREA",
                      cityCode: city.code,
                      cityName: city.name,
                    });
                    setSelectedAreaCityCode("");
                  }
                }}
                disabled={!selectedAreaCityCode}
                text="Add"
                icon={{ name: "Plus", size: 16 }}
                className="rounded-lg px-4 h-[50px]"
              />
            </div>

            {settings.deliveryAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {settings.deliveryAreas.map((area) => (
                  <span
                    key={area.cityCode}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-color-50 border border-brand-color-200 px-3 py-1.5 text-sm text-brand-color-700"
                  >
                    <DynamicIcon name="MapPin" size={14} />
                    {area.cityName}
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "REMOVE_DELIVERY_AREA",
                          cityCode: area.cityCode,
                        })
                      }
                      className="ml-0.5 rounded-full p-0.5 text-brand-color-400 hover:bg-brand-color-100 hover:text-brand-color-600 transition"
                      title={`Remove ${area.cityName}`}
                    >
                      <DynamicIcon name="X" size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                No delivery areas configured — all cities will be allowed.
              </p>
            )}
          </div>
        </>

        {/** Cash on Delivery */}
        <>
          <h2 className="text-xl font-bold text-stone-800">Cash on Delivery</h2>
          <div className="p-6 border border-gray-200 space-y-4">
            <p className="text-sm text-stone-600">
              Control Cash on Delivery (COD) globally. When enabled, customers
              can pay in cash upon delivery or pickup. Individual branches can
              override this setting to force COD on or off.
            </p>
            <Checkbox
              label="Enable Cash on Delivery"
              subLabel="Allow COD across all branches by default. Branches can override this individually."
              checked={settings.codEnabled}
              onChange={(e) =>
                dispatch({
                  type: "SET_COD_ENABLED",
                  value: e.target.checked,
                })
              }
            />
            <p className="text-xs text-stone-400">
              When disabled globally, branches set to &ldquo;Follow Global&rdquo;
              will not accept COD. A branch can still force-enable COD by
              setting its override to &ldquo;Enabled&rdquo;.
            </p>
          </div>
        </>

        {/** Free Delivery Settings */}
        <>
          <h2 className="text-xl font-bold text-stone-800">Free Delivery</h2>
          <div className="p-6 border border-gray-200 space-y-4">
            <p className="text-sm text-stone-600">
              Control free delivery globally. When enabled, customers who meet
              the minimum purchase and distance requirements get free delivery.
              Individual branches can also configure their own free delivery
              area by city or radius.
            </p>
            <Checkbox
              label="Enable Free Delivery"
              subLabel="Allow free delivery across all branches. When disabled, delivery fees always apply."
              checked={settings.freeDeliveryEnabled}
              onChange={(e) =>
                dispatch({
                  type: "SET_FREE_DELIVERY_ENABLED",
                  value: e.target.checked,
                })
              }
            />
            {settings.freeDeliveryEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Minimum Purchase (₱)"
                  subLabel="Item subtotal must reach this amount to qualify."
                  type="number"
                  value={String(settings.freeDeliveryMinimumPurchase)}
                  onChange={(e) => {
                    const val = e.target.value;
                    dispatch({
                      type: "SET_FREE_DELIVERY_MINIMUM_PURCHASE",
                      value: Math.max(0, parseFloat(val) || 0),
                    });
                  }}
                  placeholder="e.g., 549"
                  className={fieldClassName}
                />
                <InputField
                  label="Max Distance (km)"
                  subLabel="Delivery must be within this distance from the branch."
                  type="number"
                  value={String(settings.freeDeliveryMaxDistanceKm)}
                  onChange={(e) => {
                    const val = e.target.value;
                    dispatch({
                      type: "SET_FREE_DELIVERY_MAX_DISTANCE_KM",
                      value: Math.max(0, parseFloat(val) || 0),
                    });
                  }}
                  placeholder="e.g., 5"
                  className={fieldClassName}
                />
              </div>
            )}
            <p className="text-xs text-stone-400">
              Branch-level free delivery (by city or radius) is checked first.
              If the branch has its own free delivery enabled, the global
              minimum purchase still applies.
            </p>
          </div>
        </>
      </form>
    </section>
  );
};

export default SettingsPage;
