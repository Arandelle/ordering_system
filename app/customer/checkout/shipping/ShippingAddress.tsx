"use client";

import { InputField } from "@/components/ui/FormComponents/InputField";
import { PsgcAddressFields } from "@/components/customer/PsgcAddressFields";
import {
  type PsgcAddressSelection,
  normalizePsgcName,
} from "@/lib/psgcAddress";
import { ModalType, useModalQuery } from "@/hooks/utils/useModalQuery";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ShippingErrors } from "../useFormErrors";
import { OrderFormState } from "../FormSchema";
import dynamic from "next/dynamic";
import type { ResolvedDeliveryAddress } from "./DeliveryLocationPicker";
import Modal from "@/components/ui/Modal";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/hooks/api/useSettings";
import { IconButton } from "@/components/ui/buttons";
import MapPreview from "../components/MapPreview";

const DeliveryLocationPicker = dynamic(
  () => import("./DeliveryLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Loading delivery map...
      </div>
    ),
  },
);

type ShippingAddressProps = {
  shippingAddress: OrderFormState["shippingAddress"];
  errors: ShippingErrors;
  isAuthenticated: boolean;
  shouldShowSyncProfileDetails: boolean;
  onSyncProfileDetails: () => void;
  onChange: (
    type: keyof Omit<OrderFormState, "fulfillmentType" | "pickupTime">,
    field: string,
    value: string,
  ) => void;
  onBlur: (field: keyof ShippingErrors, value: string) => void;
  onCoordinatesChange: (
    coordinates: OrderFormState["shippingAddress"]["coordinates"],
  ) => void;
  openModal: (value: ModalType) => void;
};

const ShippingAddress = ({
  shippingAddress,
  errors,
  isAuthenticated,
  shouldShowSyncProfileDetails,
  onSyncProfileDetails,
  onChange,
  onBlur,
  onCoordinatesChange,
}: ShippingAddressProps) => {
  const addressQuery = [
    shippingAddress.line2,
    shippingAddress.city,
    shippingAddress.province,
    shippingAddress.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  // Fetch admin-configured delivery areas. When deliveryAreas is empty,
  // all NCR cities are allowed (no restriction passed to children).
  const { data: settings } = useSettings();
  const allowedCityCodes = useMemo(() => {
    const areas = settings?.deliveryAreas ?? [];
    return areas.length ? areas.map((a) => a.cityCode) : undefined;
  }, [settings?.deliveryAreas]);

  const allowedCityNames = useMemo(() => {
    const areas = settings?.deliveryAreas ?? [];
    return areas.length ? areas.map((a) => a.cityName) : undefined;
  }, [settings?.deliveryAreas]);

  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // One-time seed for legacy drafts that have coordinates but no pinnedCity/pinnedLine2.
  // After the first pin, these fields are saved in the draft and this effect is a no-op.
  const didSeedRef = useRef(false);
  useEffect(() => {
    if (didSeedRef.current) return;
    if (!shippingAddress.coordinates || shippingAddress.pinnedCity) return;
    didSeedRef.current = true;
    if (shippingAddress.city) {
      onChange("shippingAddress", "pinnedCity", shippingAddress.city);
    }
    if (shippingAddress.line2) {
      onChange("shippingAddress", "pinnedLine2", shippingAddress.line2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time legacy draft migration
  }, [shippingAddress.coordinates, shippingAddress.pinnedCity]);

  // Warns when the map pin's city differs from the selected dropdown city.
  // pinnedCity/pinnedLine2 are stored in form state so they persist across
  // page refreshes (session draft) and are shared with the confirmation modal.
  const pinnedCityWarning = useMemo(() => {
    const pinned = shippingAddress.pinnedCity;
    if (!pinned || !shippingAddress.city) return undefined;
    if (normalizePsgcName(pinned) === normalizePsgcName(shippingAddress.city))
      return undefined;
    return `Your pin is in "${pinned}" but the selected city is "${shippingAddress.city}". The dropdown fields will be used as your delivery address.`;
  }, [shippingAddress.pinnedCity, shippingAddress.city]);

  // Warns when the map pin's barangay differs from the selected dropdown barangay.
  const pinnedBarangayWarning = useMemo(() => {
    const pinned = shippingAddress.pinnedLine2;
    if (!pinned || !shippingAddress.line2) return undefined;
    if (normalizePsgcName(pinned) === normalizePsgcName(shippingAddress.line2))
      return undefined;
    return `Your pin is in "${pinned}" but the selected barangay is "${shippingAddress.line2}". Make sure the dropdown matches your actual delivery location.`;
  }, [shippingAddress.pinnedLine2, shippingAddress.line2]);

  const handleAddressResolved = (address: ResolvedDeliveryAddress) => {
    if (address.city) {
      onChange("shippingAddress", "pinnedCity", address.city);
    }

    if (address.line2) {
      onChange("shippingAddress", "pinnedLine2", address.line2);
    }

    if (address.placeName) {
      onChange("shippingAddress", "placeName", address.placeName);
    }

    if (address.line2) {
      onChange("shippingAddress", "line2", address.line2);
      onBlur("line2", address.line2);
    }

    if (address.subMunicipality) {
      onChange("shippingAddress", "subMunicipality", address.subMunicipality);
    }

    if (address.city) {
      onChange("shippingAddress", "city", address.city);
      onBlur("city", address.city);
    }

    if (address.province) {
      onChange("shippingAddress", "province", address.province);
      onBlur("province", address.province);
    }

    if (address.zipCode) {
      onChange("shippingAddress", "zipCode", address.zipCode);
      onBlur("zipCode", address.zipCode);
    }
  };

  const handlePsgcFieldChange = (
    field: keyof PsgcAddressSelection,
    value: string,
  ) => {
    onChange("shippingAddress", field, value);

    if (field === "city" || field === "province" || field === "line2") {
      onBlur(field, value);
    }
  };

  const { modal, openModal, closeModal } = useModalQuery();
  const [showProfileHint, setShowProfileHint] = useState(false);
  const [showMapHint, setShowMapHint] = useState(true);
  const hasPinnedLocation = Boolean(shippingAddress.coordinates);
  const pinnedLocationLabel =
    shippingAddress.placeName ||
    [shippingAddress.line2, shippingAddress.city].filter(Boolean).join(", ");
  const pinButtonTitle = hasPinnedLocation
    ? "Delivery location pinned"
    : "Pin your delivery location";
  const pinButtonDescription = hasPinnedLocation
    ? pinnedLocationLabel || "Coordinates saved for delivery"
    : "Open the map to search, use current location, or place the pin manually.";

  return (
    <div className="space-y-5 py-6">
      {shouldShowSyncProfileDetails && (
        <IconButton
          type="button"
          onClick={onSyncProfileDetails}
          text="Sync from profile"
          icon={{ name: "RefreshCw", size: 15 }}
          variant="secondary"
          className="rounded-md place-self-end"
        />
      )}

      {isAuthenticated && (
        <div className="space-y-2 text-sm text-slate-600">
          <IconButton
            type="button"
            onClick={() => setShowProfileHint((current) => !current)}
            variant="ghost"
            icon={{ name: "CircleHelp" }}
            text="Why is my address filled?"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-transparent"
          />

          {showProfileHint && (
            <p className="text-xs leading-5 text-slate-500">
              Your saved profile address may be used as a starting point. Check
              the pinned map location and address fields before placing the
              order.
            </p>
          )}
        </div>
      )}

      {(pinnedCityWarning || pinnedBarangayWarning) && (
        <div className="space-y-2">
          {pinnedCityWarning && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
              <DynamicIcon
                name="AlertTriangle"
                size={14}
                className="mt-0.5 shrink-0 text-amber-500"
              />
              <p>{pinnedCityWarning}</p>
            </div>
          )}
          {pinnedBarangayWarning && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
              <DynamicIcon
                name="AlertTriangle"
                size={14}
                className="mt-0.5 shrink-0 text-amber-500"
              />
              <p>{pinnedBarangayWarning}</p>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-4 text-left shadow-sm transition-colors ${
          errors.coordinates
            ? "border-red-300 bg-red-50 hover:bg-red-100"
            : hasPinnedLocation
              ? "border-green-200 bg-green-50 hover:bg-green-100"
              : "border-brand-color-200 bg-brand-color-50 hover:bg-brand-color-100"
        }`}
        onClick={() => openModal("shipping-address-coordinates")}
      >
        <span
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            errors.coordinates
              ? "bg-red-100 text-red-600"
              : hasPinnedLocation
                ? "bg-green-100 text-green-700"
                : "bg-white text-brand-color-600"
          }`}
        >
          <DynamicIcon
            name={hasPinnedLocation ? "MapPinned" : "MapPinPlus"}
            size={18}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm font-semibold ${
              errors.coordinates ? "text-red-700" : "text-slate-900"
            }`}
          >
            {pinButtonTitle}
          </span>
          <span
            className={`mt-1 block text-xs leading-5 ${
              errors.coordinates ? "text-red-600" : "text-slate-600"
            }`}
          >
            {errors.coordinates || pinButtonDescription}
          </span>
          {hasPinnedLocation && (
            <span className="mt-2 block text-[11px] font-medium text-slate-500">
              {shippingAddress.coordinates?.lat.toFixed(6)},{" "}
              {shippingAddress.coordinates?.lng.toFixed(6)}
            </span>
          )}
        </span>
        <DynamicIcon
          name="ChevronRight"
          size={18}
          className="mt-2 shrink-0 text-slate-400"
        />
      </button>

      {/* Static map preview of the pinned delivery location */}
      {hasPinnedLocation && shippingAddress.coordinates && (
        <MapPreview
          lat={shippingAddress.coordinates.lat}
          lng={shippingAddress.coordinates.lng}
          className="mt-0"
        />
      )}

      {/** How delivery calculated question */}
      <div className="space-y-2 text-sm text-slate-600">
        <IconButton
          type="button"
          onClick={() => setShowMapHint((current) => !current)}
          variant="ghost"
          icon={{ name: "CircleHelp" }}
          text="How is delivery fee calculated?"
          className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-transparent"
        />
        {showMapHint && (
          <p className="text-xs leading-5 text-slate-500">
            Delivery fee and service coverage follow the pinned map coordinates.
            The city, area, barangay, and address fields add the delivery
            details,{" "}
            <span className="text-red-500">
              so keep them accurate and matched with the pin.
            </span>
          </p>
        )}
      </div>

      {/* Line 1 */}
      <div className="grid grid-cols-1 gap-4">
        <InputField
          label="Address line 1"
          subLabel="House no., Street name."
          placeholder="House no. / Street"
          type="text"
          name="line1"
          value={shippingAddress.line1}
          onChange={(e) => onChange("shippingAddress", "line1", e.target.value)}
          onBlur={(e) => onBlur("line1", e.target.value)}
          required
          leftIcon={<DynamicIcon name="MapPin" size={15} />}
          error={errors.line1}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PsgcAddressFields
          value={shippingAddress}
          errors={{
            city: errors.city,
            province: errors.province,
            line2: errors.line2,
          }}
          onFieldChange={handlePsgcFieldChange}
          onFieldBlur={onBlur}
          allowedCityCodes={allowedCityCodes}
          regionHint="Delivery is currently limited to NCR addresses."
        />
      </div>

      {/* Postal Code & Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Postal Code"
          placeholder="e.g. 1100"
          type="text"
          name="zipCode"
          value={shippingAddress.zipCode}
          onChange={(e) =>
            onChange("shippingAddress", "zipCode", e.target.value)
          }
          onBlur={(e) => onBlur("zipCode", e.target.value)}
          required
          leftIcon={<DynamicIcon name="Hash" size={15} />}
          error={errors.zipCode}
        />
        <InputField
          label="Country"
          type="text"
          name="country"
          value="Philippines"
          disabled
          className="bg-gray-200 text-gray-400"
          leftIcon={<DynamicIcon name="Globe" size={15} />}
        />
      </div>

      {/* Landmark */}
      <InputField
        label="Landmark (Optional)"
        placeholder="e.g. Near Jollibee on Katipunan"
        type="text"
        name="landmark"
        value={shippingAddress.landmark ?? ""}
        onChange={(e) =>
          onChange("shippingAddress", "landmark", e.target.value)
        }
        leftIcon={<DynamicIcon name="Flag" size={15} />}
        error={errors.landmark}
      />

      {modal === "shipping-address-coordinates" && (
        <Modal
          onClose={closeModal}
          title="Pin delivery location"
          subTitle="  Search your address, allow current location, or click and drag the
                pin for the exact dropoff point."
        >
          <>
            <DeliveryLocationPicker
              value={shippingAddress.coordinates}
              addressQuery={shippingAddress.placeName || addressQuery}
              allowedCityNames={allowedCityNames}
              error={errors.coordinates}
              onChange={onCoordinatesChange}
              onAddressResolved={handleAddressResolved}
              onResolvingAddressChange={setIsResolvingAddress}
            />
            {shippingAddress?.placeName && (
              <div className="w-full flex py-2">
                <IconButton
                  disabled={isResolvingAddress}
                  onClick={closeModal}
                  icon={{
                    name: isResolvingAddress ? "Loader2" : "Check",
                    className: isResolvingAddress ? "animate-spin" : "",
                  }}
                  text={
                    isResolvingAddress
                      ? "Searching place..."
                      : shippingAddress.placeName
                  }
                  className="ml-auto rounded-lg px-3"
                  title={
                    isResolvingAddress
                      ? "Searching place..."
                      : `Select ${shippingAddress.placeName}`
                  }
                />
              </div>
            )}
          </>
        </Modal>
      )}
    </div>
  );
};

export default ShippingAddress;
