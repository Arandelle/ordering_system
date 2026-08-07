"use client";

// ─── Tab: Address ─────────────────────────────────────────────────────────────

import { InputField } from "@/components/ui/FormComponents/InputField";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { PsgcAddressFields } from "@/components/customer/PsgcAddressFields";
import type { ShippingAddressForm } from "@/types/address";
import { SectionCard } from "../component/SectionCard";
import { toast } from "sonner";
import { useMyAddress, useUpdateAddress } from "../../hooks/useMyAddress";
import { useEffect, useMemo, useState } from "react";
import {
  NCR_REGION,
  normalizePsgcName,
  type PsgcAddressSelection,
} from "@/lib/psgcAddress";
import { useModalQuery } from "@/hooks/utils/useModalQuery";
import Modal from "@/components/ui/Modal";
import dynamic from "next/dynamic";
import type { ResolvedDeliveryAddress } from "../../checkout/shipping/DeliveryLocationPicker";
import { useSettings } from "@/hooks/api/useSettings";
import { ShippingFieldsSchema } from "../../checkout/FormSchema";
import MapPreview from "../../checkout/components/MapPreview";
import { IconButton } from "@/components/ui/buttons";

const DeliveryLocationPicker = dynamic(
  () => import("../../checkout/shipping/DeliveryLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Loading delivery map...
      </div>
    ),
  },
);

// ─── Validation using shared checkout schema ─────────────────────────────────

// These must match the schemas in lib/validations.ts (used by ShippingFieldsSchema)
const LINE1_MAX_LENGTH = 200;
const LANDMARK_MAX_LENGTH = 100;
const ZIP_CODE_MAX_LENGTH = 4;

type AddressErrors = Partial<Record<keyof ShippingAddressForm, string>>;

const validateAddress = (form: ShippingAddressForm): AddressErrors => {
  const errors: AddressErrors = {};

  // Use the same schema as checkout shipping address
  const result = ShippingFieldsSchema.safeParse(form);

  if (!result.success) {
    // Extract field-specific errors
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof ShippingAddressForm;
      // Only store the first error for each field
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    });
  }

  return errors;
};

const DEFAULT_ADDRESS_FORM: ShippingAddressForm = {
  placeName: "",
  line1: "",
  line2: "",
  city: "",
  cityCode: "",
  province: NCR_REGION.displayName,
  region: NCR_REGION.name,
  regionCode: NCR_REGION.code,
  barangayCode: "",
  subMunicipality: "",
  subMunicipalityCode: "",
  zipCode: "",
  country: "Philippines",
  landmark: "",
};

const AddressTab = () => {
  const updateAddress = useUpdateAddress();
  const { data: myAddress, isPending } = useMyAddress();

  const [form, setForm] = useState<ShippingAddressForm>(DEFAULT_ADDRESS_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<AddressErrors>({});

  // Admin-configured delivery areas — empty means all NCR cities allowed.
  const { data: settings } = useSettings();
  const allowedCityCodes = useMemo(() => {
    const areas = settings?.deliveryAreas ?? [];
    return areas.length ? areas.map((a) => a.cityCode) : undefined;
  }, [settings?.deliveryAreas]);
  const allowedCityNames = useMemo(() => {
    const areas = settings?.deliveryAreas ?? [];
    return areas.length ? areas.map((a) => a.cityName) : undefined;
  }, [settings?.deliveryAreas]);

  const { modal, openModal, closeModal } = useModalQuery();

  const hasPinnedLocation = Boolean(form.coordinates);

  // Keep the form aligned with the saved profile address returned by the API.
  useEffect(() => {
    if (myAddress?.shippingAddress) {
      setForm({
        ...DEFAULT_ADDRESS_FORM,
        ...myAddress.shippingAddress,
        province: myAddress.shippingAddress.province || NCR_REGION.displayName,
        region: myAddress.shippingAddress.region || NCR_REGION.name,
        regionCode: myAddress.shippingAddress.regionCode || NCR_REGION.code,
        country: "Philippines",
      });
    }
  }, [myAddress]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    // Enforce max lengths - but allow editing if value is being shortened
    // (handles cases where existing data exceeds limits due to pre-validation saves)
    if (
      name === "line1" &&
      value.length > LINE1_MAX_LENGTH &&
      value.length >= form.line1.length
    )
      return;
    if (
      name === "landmark" &&
      value.length > LANDMARK_MAX_LENGTH &&
      value.length >= (form.landmark?.length || 0)
    )
      return;
    if (
      name === "zipCode" &&
      value.length > ZIP_CODE_MAX_LENGTH &&
      value.length >= form.zipCode.length
    )
      return;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof AddressErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddressFieldChange = (
    field: keyof PsgcAddressSelection,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // The map pin itself only owns coordinates. These coordinates are saved on
  // the profile and later used by checkout as the default delivery pin.
  const handleCoordinatesChange = (
    coordinates: ShippingAddressForm["coordinates"],
  ) => {
    setForm((prev) => ({ ...prev, coordinates }));
  };

  // Tracks the city from the last map pin reverse-geocode.
  const [pinnedCity, setPinnedCity] = useState<string | undefined>(undefined);
  const [pinnedBarangay, setPinnedBarangay] = useState<string | undefined>(
    undefined,
  );

  const pinnedCityWarning = useMemo(() => {
    if (!pinnedCity || !form.city) return undefined;
    if (normalizePsgcName(pinnedCity) === normalizePsgcName(form.city))
      return undefined;
    return `Your pin is in "${pinnedCity}" but the selected city is "${form.city}". The dropdown fields will be used as your delivery address.`;
  }, [pinnedCity, form.city]);

  const pinnedBarangayWarning = useMemo(() => {
    if (!pinnedBarangay || !form.line2) return undefined;
    if (normalizePsgcName(pinnedBarangay) === normalizePsgcName(form.line2))
      return undefined;
    return `Your pin is in "${pinnedBarangay}" but the selected barangay is "${form.line2}". Make sure the dropdown matches your actual delivery location.`;
  }, [pinnedBarangay, form.line2]);

  // Reverse geocoding gives us address names, not PSGC codes. We update the
  // visible fields from those names, then clear old codes that may belong to a
  // previous city/barangay. PsgcAddressFields will match the new names against
  // the loaded PSGC options and write the correct codes back into this form.
  const handleAddressResolved = (address: ResolvedDeliveryAddress) => {
    if (address.city) {
      setPinnedCity(address.city);
    }
    if (address.line2) {
      setPinnedBarangay(address.line2);
    }
    setForm((prev) => ({
      ...prev,
      ...(address.line2
        ? {
            // line2 is the barangay display value used by profile and checkout.
            line2: address.line2,
            barangayCode: "",
          }
        : {}),
      ...(address.subMunicipality
        ? {
            // Manila addresses need an extra area level before barangay.
            subMunicipality: address.subMunicipality,
            subMunicipalityCode: "",
          }
        : {}),
      ...(address.city
        ? {
            // Keep the service region locked to NCR even when the map returns
            // only a city name.
            city: address.city,
            cityCode: "",
            province: NCR_REGION.displayName,
            region: NCR_REGION.name,
            regionCode: NCR_REGION.code,
          }
        : {}),
      ...(address.zipCode ? { zipCode: address.zipCode } : {}),
      ...(address.placeName
        ? {
            placeName: address.placeName,
          }
        : {}),
    }));
  };

  const handleSave = async () => {
    // Validate address fields
    const validationErrors = validateAddress(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    setSaving(true);
    try {
      await updateAddress.mutateAsync({ address: form });
      toast.success("Address updated successfully");
    } catch (error: any) {
      // apiClient throws { message, details } object, not Error instance
      const errorMessage = error?.message || "Failed to update address";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (isPending) {
    return (
      <SectionCard
        title="Shipping Address"
        subtitle="Default address for deliveries and orders"
        icon="MapPin"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          {/* Line 1 */}
          <div className="sm:col-span-2 h-10 bg-gray-100 rounded-xl" />
          {/* Region + City */}
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />
          {/* Barangay + Province */}
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />
          {/* ZIP + Country */}
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />
          {/* Landmark */}
          <div className="sm:col-span-2 h-10 bg-gray-100 rounded-xl" />
        </div>

        {/* Save button skeleton */}
        <div className="mt-6 flex justify-end">
          <div className="h-10 w-36 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Shipping Address"
      subtitle="Default address for deliveries and orders"
      icon="MapPin"
    >
      <div className="mb-5 space-y-3">
        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
          <DynamicIcon
            name="Info"
            size={14}
            className="mt-0.5 shrink-0 text-slate-400"
          />
          <p>
            Use the map to pin your approximate location. Then confirm your
            exact city and barangay using the fields below — these will be your
            delivery address.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openModal("shipping-address-coordinates")}
          className={`flex w-full items-start gap-3 rounded-xl border px-4 py-4 text-left transition-colors ${
            hasPinnedLocation
              ? "border-green-200 bg-green-50 hover:bg-green-100"
              : "border-brand-color-200 bg-brand-color-50 hover:bg-brand-color-100"
          }`}
        >
          <span
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              hasPinnedLocation
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
            <span className="block text-sm font-semibold text-slate-900">
              {hasPinnedLocation
                ? "Default delivery pin saved"
                : "Pin your default delivery location"}
            </span>

            <span className="mt-1 block text-xs leading-5 text-slate-600">
              {form.placeName ||
                "The pin saves coordinates for checkout prefill. Your selected city, barangay, and address line stay as the official address."}
            </span>

            {hasPinnedLocation && (
              <span className="mt-2 block text-[11px] font-medium text-slate-500">
                {form.coordinates?.lat.toFixed(6)},{" "}
                {form.coordinates?.lng.toFixed(6)}
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
        {hasPinnedLocation && form.coordinates && (
          <MapPreview
            lat={form.coordinates.lat}
            lng={form.coordinates.lng}
            className="mt-0"
          />
        )}
      </div>

      {modal === "shipping-address-coordinates" && (
        <Modal
          title="Pin your default delivery location"
          subTitle="Search, use current location, or click the map to save checkout prefill coordinates."
          onClose={closeModal}
        >
          <DeliveryLocationPicker
            value={form.coordinates}
            addressQuery={form.placeName ?? ""}
            allowedCityNames={allowedCityNames}
            onChange={handleCoordinatesChange}
            onAddressResolved={handleAddressResolved}
          />
          {form.coordinates && (
            <div className="mt-4 flex justify-end">
              <IconButton
                type="button"
                onClick={closeModal}
                text={form.placeName || "Use this pin location"}
                icon={{name: "MapPinned", size: 15}}
                className="px-3 rounded-lg"
              />
            </div>
          )}
        </Modal>
      )}

      {/* Warning when pinned location differs from selected address */}
      {(pinnedCityWarning || pinnedBarangayWarning) && (
        <div className="mb-4 space-y-2">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField
            label="Address Line 1"
            name="line1"
            value={form.line1}
            onChange={handleInputChange}
            placeholder="House/Unit No., Street Name, Barangay"
            leftIcon={<DynamicIcon name="Home" />}
            required
            maxLength={LINE1_MAX_LENGTH}
            error={errors.line1}
          />
        </div>
        <PsgcAddressFields
          value={form}
          onFieldChange={handleAddressFieldChange}
          allowedCityCodes={allowedCityCodes}
          regionHint="Delivery is currently limited to NCR addresses."
        />
        <InputField
          label="ZIP Code"
          name="zipCode"
          value={form.zipCode}
          onChange={handleInputChange}
          placeholder="1100"
          leftIcon={<DynamicIcon name="Hash" />}
          required
          maxLength={ZIP_CODE_MAX_LENGTH}
          error={errors.zipCode}
        />
        <InputField
          label="Country"
          name="country"
          value={form.country}
          onChange={handleInputChange}
          leftIcon={<DynamicIcon name="Globe" />}
          disabled
        />
        <div className="sm:col-span-2">
          <InputField
            label="Landmark"
            name="landmark"
            value={form.landmark}
            onChange={handleInputChange}
            placeholder="Near SM, beside the church, etc."
            leftIcon={<DynamicIcon name="Navigation" />}
            maxLength={LANDMARK_MAX_LENGTH}
            error={errors.landmark}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <IconButton
          onClick={handleSave}
          disabled={saving}
          loadingText="Saving..."
          isLoading={saving}
          icon={{ name: "Save", size: 15 }}
          text="Save Address"
          title="Save your shipping address"
          className="px-3 rounded-lg"
        />
      </div>
    </SectionCard>
  );
};

export default AddressTab;
