"use client";

import React, { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  useCreateBranch,
  useUpdateBranch,
  formatBranchDataForForm,
} from "@/hooks/api/useBranch";
import { Branch, BranchFormData, BranchFormErrors } from "@/types/branch";
import {
  ToggleButton,
  InputField,
  SelectField,
} from "@/components/ui/FormComponents";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { IconButton } from "@/components/ui/buttons";
import MapParent from "./MapComponent/MapParent";
import {
  NCR_REGION,
  fetchNcrCities,
  fetchCityBarangays,
} from "@/lib/psgcAddress";

const emptyForm: BranchFormData = {
  name: "",
  address: {
    line1: "",
    city: "",
    cityCode: "",
    barangayCode: "",
    province: "Metro Manila",
  },
  location: {
    latitude: "",
    longitude: "",
  },
  deliveryRadiusKm: null,
  openingSoon: false,
  isBusy: false,
  maxActiveOrders: null,
  maxReservationsPerHour: null,
  maxReservationsPerDay: null,
};

type BranchFormProps = {
  /** Pre-filled branch data for edit mode */
  branch?: Branch;
};

/**
 * Self-contained branch form used by both /stores/new and /stores/edit pages.
 * Manages its own state, validation, and navigation.
 */
const BranchForm = ({ branch }: BranchFormProps) => {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<"lat" | "lng" | null>(null);

  const initialForm = branch ? formatBranchDataForForm(branch) : emptyForm;
  const [form, setForm] = useState<BranchFormData>(initialForm);
  const [errors, setErrors] = useState<BranchFormErrors>({});

  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const isSaving = createBranch.isPending || updateBranch.isPending;

  // PSGC: NCR cities for branch location
  const { data: ncrCities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ["psgc", "ncr-cities"],
    queryFn: fetchNcrCities,
    staleTime: 1000 * 60 * 60 * 24,
  });

  // PSGC: Barangays for the selected city
  const { data: barangays = [], isLoading: isLoadingBarangays } = useQuery({
    queryKey: ["psgc", "branch-barangays", form.address.cityCode],
    queryFn: () => fetchCityBarangays(form.address.cityCode),
    enabled: Boolean(form.address.cityCode),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const handleCityChange = (cityCode: string) => {
    const city = ncrCities.find((c) => c.code === cityCode);
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        city: city?.name ?? "",
        cityCode,
        // Reset barangay when city changes
        barangayCode: "",
      },
    }));
    setErrors((prev) => ({ ...prev, address: undefined }));
  };

  const handleBarangayChange = (barangayCode: string) => {
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        barangayCode,
      },
    }));
  };

  const handleAddressLine1Change = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, line1: e.target.value },
    }));
    setErrors((prev) => ({ ...prev, address: undefined }));
  };

  const validate = (): BranchFormErrors => {
    const e: BranchFormErrors = {};
    if (!form.name.trim()) e.name = "Branch name is required.";
    if (!form.address.line1.trim()) e.address = "Address is required.";
    if (!form.address.city.trim()) e.address = e.address || "City is required.";
    if (!form.location?.latitude || !form.location?.longitude) {
      e.location = "Coordinates (latitude & longitude) are required.";
    }
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (branch) {
      await updateBranch.mutateAsync({ id: branch._id, branchData: form });
    } else {
      await createBranch.mutateAsync(form);
    }

    router.push("/stores");
  };

  const handleChangeForm = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCoordinateChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "latitude" | "longitude",
  ) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      location: {
        latitude: prev.location?.latitude || "",
        longitude: prev.location?.longitude || "",
        [type]: value,
      },
    }));
    setErrors((prev) => ({ ...prev, location: undefined }));
  };

  const handleMapCoordinates = (latitude: number, longitude: number) => {
    setForm((prev) => ({
      ...prev,
      location: {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      },
    }));
    setErrors((prev) => ({ ...prev, location: undefined }));
  };

  const copyToClipboard = (value: string, field: "lat" | "lng") => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fieldClass = "bg-white border border-gray-200";

  return (
    <div className="max-w-7xl mx-auto mt-4 space-y-6">
      {/* ── Section 1: Status & Branch Info ── */}
      <section>
        <h2 className="text-lg font-bold text-stone-800 mb-3">Branch Information</h2>
        <div className="p-5 border border-gray-200 rounded-lg bg-white space-y-4">
          {/* Toggles row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToggleButton
              label="Opening Soon"
              subLabel="Branch is not yet accepting orders"
              checked={form.openingSoon}
              onCheckedChange={(val) =>
                setForm((prev) => ({ ...prev, openingSoon: val }))
              }
              error={errors.openingSoon}
            />
            <ToggleButton
              label="Pause Orders (Busy)"
              subLabel="Temporarily block new orders when overloaded"
              checked={form.isBusy}
              onCheckedChange={(val) =>
                setForm((prev) => ({ ...prev, isBusy: val }))
              }
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <InputField
              label="Branch Name"
              value={form.name}
              onChange={handleChangeForm}
              name="name"
              placeholder="e.g., Century Mall"
              error={errors.name}
              required
              className={`${fieldClass} capitalize`}
            />
          </div>
        </div>
      </section>

      {/* ── Section 2: Address & Map ── */}
      <section>
        <h2 className="text-lg font-bold text-stone-800 mb-3">Address & Location</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left column — PSGC address fields */}
          <div className="p-5 border border-gray-200 rounded-lg bg-white space-y-3">
            <SelectField
              label="Region"
              options={[
                { value: NCR_REGION.code, label: NCR_REGION.displayName },
              ]}
              disabled
              leftIcon={<DynamicIcon name="Map" size={15} />}
              className="text-sm"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="City / Municipality"
                value={form.address.cityCode}
                onChange={(e) => handleCityChange(e.target.value)}
                options={[
                  { value: "", label: "Select City", disabled: true },
                  ...ncrCities.map((city) => ({
                    value: city.code,
                    label: city.name,
                  })),
                ]}
                disabled={isLoadingCities}
                leftIcon={<DynamicIcon name="Building2" size={15} />}
                errors={errors.address}
                className="text-sm"
                required
              />

              <SelectField
                label="Barangay"
                value={form.address.barangayCode}
                onChange={(e) => handleBarangayChange(e.target.value)}
                disabled={isLoadingBarangays || !form.address.cityCode}
                options={[
                  {
                    value: "",
                    label: isLoadingBarangays
                      ? "Loading..."
                      : !form.address.cityCode
                        ? "Select city first"
                        : "Select barangay",
                    disabled: true,
                  },
                  ...barangays.map((brgy) => ({
                    value: brgy.code,
                    label: brgy.name,
                  })),
                ]}
                leftIcon={<DynamicIcon name="MapPin" size={15} />}
                className="text-sm"
              />
            </div>

            <InputField
              label="Street Address"
              value={form.address.line1}
              onChange={handleAddressLine1Change}
              placeholder="e.g., 123 Rizal Ave"
              error={errors.address}
              className={`${fieldClass} capitalize`}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Province"
                value={form.address.province}
                disabled
                className="text-sm"
              />
              <InputField
                label="Country"
                value="Philippines"
                disabled
                className="text-sm"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Barangay is used for free delivery matching — customers in the same barangay get free delivery.
            </p>
          </div>

          {/* Right column — Map + coordinates */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <MapParent onSelectCoordinates={handleMapCoordinates} />
              {errors.location && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.location}
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <DynamicIcon name="Crosshair" size={16} className="text-slate-500" />
                <p className="text-sm font-semibold text-slate-700">
                  Coordinates <span className="text-red-500">*</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  subLabel="Latitude"
                  type="text"
                  name="latitude"
                  value={form.location?.latitude || ""}
                  onChange={(e) => handleCoordinateChange(e, "latitude")}
                  placeholder="14.5995"
                  className="pr-9 text-sm"
                  rightElement={
                    form.location?.latitude && (
                      <IconButton
                        type="button"
                        onClick={() =>
                          copyToClipboard(form.location!.latitude, "lat")
                        }
                        variant="ghost"
                        title="Copy latitude"
                        icon={{
                          name: copiedField === "lat" ? "Check" : "Copy",
                          className: copiedField
                            ? "text-green-600"
                            : "text-gray-400",
                        }}
                      />
                    )
                  }
                />
                <InputField
                  subLabel="Longitude"
                  type="text"
                  name="longitude"
                  value={form.location?.longitude || ""}
                  onChange={(e) => handleCoordinateChange(e, "longitude")}
                  placeholder="120.9842"
                  className="pr-9 text-sm"
                  rightElement={
                    form.location?.longitude && (
                      <IconButton
                        type="button"
                        onClick={() =>
                          copyToClipboard(form.location!.longitude, "lng")
                        }
                        variant="ghost"
                        title="Copy longitude"
                        icon={{
                          name: copiedField === "lng" ? "Check" : "Copy",
                          className: copiedField
                            ? "text-green-600"
                            : "text-gray-400",
                        }}
                      />
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Capacity & Delivery ── */}
      <section>
        <h2 className="text-lg font-bold text-stone-800 mb-3">Capacity & Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Order Capacity */}
          <div className="p-5 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
            <div className="flex items-center gap-2">
              <DynamicIcon name="ShoppingBag" size={18} className="text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">Order Capacity</p>
            </div>
            <InputField
              label="Max Active Orders"
              subLabel="Max concurrent orders. Empty = global setting."
              type="number"
              name="maxActiveOrders"
              value={
                form.maxActiveOrders === null
                  ? ""
                  : String(form.maxActiveOrders)
              }
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  maxActiveOrders:
                    val === "" ? null : Math.max(1, parseInt(val) || 1),
                }));
              }}
              placeholder="No limit"
              className={fieldClass}
            />
          </div>

          {/* Reservation Capacity */}
          <div className="p-5 bg-indigo-50 rounded-lg border border-indigo-200 space-y-3">
            <div className="flex items-center gap-2">
              <DynamicIcon name="CalendarClock" size={18} className="text-indigo-600" />
              <p className="text-sm font-semibold text-indigo-800">Reservations</p>
            </div>
            <p className="text-[11px] text-slate-500">
              Dine-in limits. Empty = global setting.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Per Hour"
                type="number"
                name="maxReservationsPerHour"
                value={
                  form.maxReservationsPerHour === null
                    ? ""
                    : String(form.maxReservationsPerHour)
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    maxReservationsPerHour:
                      val === "" ? null : Math.max(1, parseInt(val) || 1),
                  }));
                }}
                placeholder="e.g., 10"
                className={fieldClass}
              />
              <InputField
                label="Per Day"
                type="number"
                name="maxReservationsPerDay"
                value={
                  form.maxReservationsPerDay === null
                    ? ""
                    : String(form.maxReservationsPerDay)
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    maxReservationsPerDay:
                      val === "" ? null : Math.max(1, parseInt(val) || 1),
                  }));
                }}
                placeholder="e.g., 50"
                className={fieldClass}
              />
            </div>
          </div>

          {/* Delivery Radius */}
          <div className="p-5 bg-green-50 rounded-lg border border-green-200 space-y-3">
            <div className="flex items-center gap-2">
              <DynamicIcon name="Truck" size={18} className="text-green-600" />
              <p className="text-sm font-semibold text-green-800">Delivery</p>
            </div>
            <InputField
              label="Delivery Radius (km)"
              subLabel="Overrides global max distance. Empty = global setting."
              type="number"
              name="deliveryRadiusKm"
              value={
                form.deliveryRadiusKm === null
                  ? ""
                  : String(form.deliveryRadiusKm)
              }
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  deliveryRadiusKm:
                    val === "" ? null : Math.max(0, parseFloat(val) || 0),
                }));
              }}
              placeholder="Use global"
              className={fieldClass}
            />
          </div>
        </div>
      </section>

      {/* ── Action Buttons ── */}
      <div className="flex gap-2 justify-end pb-6">
        <IconButton
          onClick={() => router.push("/stores")}
          variant="outline"
          text="Cancel"
          className="rounded-lg px-4"
        />
        <IconButton
          onClick={handleSubmit}
          disabled={isSaving}
          text={
            isSaving ? "Saving..." : branch ? "Update Branch" : "Create Branch"
          }
          className="rounded-lg px-4"
          icon={{
            name: isSaving ? "Loader2" : null,
            className: "animate-spin",
          }}
        />
      </div>
    </div>
  );
};

export default BranchForm;
