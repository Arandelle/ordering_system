import { useCreateBranch, useUpdateBranch } from "@/hooks/api/useBranch";
import { Branch, BranchFormData, BranchFormErrors } from "@/types/branch";
import React, { ChangeEvent, useState } from "react";
import { emptyForm } from "./page";
import Modal from "@/components/ui/Modal";
import MapParent from "./MapComponent/MapParent";
import { ToggleButton, InputField } from "@/components/ui/FormComponents";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { IconButton } from "@/components/ui/buttons";

type BranchModalProps = {
  form: BranchFormData;
  setForm: React.Dispatch<React.SetStateAction<BranchFormData>>;
  errors: BranchFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<BranchFormErrors>>;
  branchToUpdate: Branch | null;
  setBranchToUpdate: React.Dispatch<React.SetStateAction<Branch | null>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const BranchModal = ({
  branchToUpdate,
  setBranchToUpdate,
  setShowModal,
  form,
  setForm,
  errors,
  setErrors,
}: BranchModalProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<"lat" | "lng" | null>(null);

  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const validate = (): BranchFormErrors => {
    const e: BranchFormErrors = {};
    if (!form.name.trim()) e.name = "Branch name is required.";
    if (!form.address.trim()) e.address = "Address is required.";
    if (!form.location?.latitude || !form.location?.longitude) {
      e.location = "Coordinates (latitude & longitude) are required.";
    }
    return e;
  };

  const handleSubmit = async () => {
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    if (branchToUpdate) {
      await updateBranch.mutateAsync({
        id: branchToUpdate._id,
        branchData: form,
      });
    } else {
      await createBranch.mutateAsync(form);
    }

    setShowModal(false);
    setForm(emptyForm);
    setErrors({});
    setBranchToUpdate(null);
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

  // Called when user selects coordinates from the map
  const handleMapCoordinates = (latitude: number, longitude: number) => {
    setForm((prev) => ({
      ...prev,
      location: {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      },
    }));
    setErrors((prev) => ({ ...prev, location: undefined }));
    setIsMapOpen(false);
  };

  const copyToClipboard = (value: string, field: "lat" | "lng") => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hasCoordinates = form.location?.latitude && form.location?.longitude;

  return (
    <div>
      {/* Opening Soon Toggle */}
      <div className="mb-4">
        <ToggleButton
          label="Opening Soon"
          subLabel="Mark as not yet ready for orders"
          checked={form.openingSoon}
          onCheckedChange={(val) =>
            setForm((prev) => ({ ...prev, openingSoon: val }))
          }
          error={errors.openingSoon}
        />
      </div>

      {/* Order Capacity Controls */}
      <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <DynamicIcon name="Truck" size={18} className="text-amber-600" />
          <p className="text-sm font-semibold text-amber-700">Order Capacity</p>
        </div>

        <ToggleButton
          label="Pause Orders (Busy)"
          subLabel="Manually block new orders — use when overloaded or dealing with operational issues"
          checked={form.isBusy}
          onCheckedChange={(val) =>
            setForm((prev) => ({ ...prev, isBusy: val }))
          }
        />

        <div className="mt-3">
          <InputField
            label="Max Active Orders"
            subLabel=" Maximum concurrent orders this branch can handle. Leave empty to use
              the global setting."
            type="number"
            name="maxActiveOrders"
            value={
              form.maxActiveOrders === null ? "" : String(form.maxActiveOrders)
            }
            onChange={(e) => {
              const val = e.target.value;
              setForm((prev) => ({
                ...prev,
                maxActiveOrders:
                  val === "" ? null : Math.max(1, parseInt(val) || 1),
              }));
            }}
            placeholder="Leave empty for no limit (uses global setting)"
            className=""
          />
        </div>
      </div>

      {/* Reservation Capacity Controls */}
      <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-2 mb-3">
          <DynamicIcon
            name="CalendarClock"
            size={18}
            className="text-indigo-600"
          />
          <p className="text-sm font-semibold text-indigo-700">
            Reservation Capacity
          </p>
        </div>

        <p className="text-[11px] text-slate-500 mb-3">
          Limits for dine-in reservations. Leave empty for no limit (uses global
          setting).
        </p>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Max Per Hour"
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
          />

          <InputField
            label=" Max Per Day"
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
          />
        </div>
      </div>

      {/* Basic Info */}
      <div className="flex flex-col gap-2.5 mb-4">
        <InputField
          label="Branch Name"
          value={form.name}
          onChange={handleChangeForm}
          name="name"
          placeholder="e.g., Century Mall"
          error={errors.name}
          required
          className="capitalize"
        />

        <InputField
          label="Address"
          value={form.address}
          onChange={handleChangeForm}
          name="address"
          placeholder="e.g., 123 Rizal Ave"
          error={errors.address}
          className="capitalize"
          required
        />
      </div>

      {/* Coordinates Section */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <DynamicIcon
            name="MapPin"
            size={18}
            className="text-brand-color-600"
          />
          <p className="text-sm font-semibold text-slate-700">
            Location Coordinates
          </p>
        </div>

        {/* Manual Coordinate Input */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <InputField
            label="Latitude"
            type="text"
            name="latitude"
            value={form.location?.latitude || ""}
            onChange={(e) => handleCoordinateChange(e, "latitude")}
            placeholder="e.g., 14.5995"
            className="pr-9"
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
                    className: copiedField ? "text-green-600" : "text-gray-400",
                  }}
                />
              )
            }
          />

          <InputField
            label="Longitude"
            type="text"
            name="longitude"
            value={form.location?.longitude || ""}
            onChange={(e) => handleCoordinateChange(e, "longitude")}
            placeholder="e.g., 120.9842"
            className="pr-9"
            rightElement={
              form.location?.latitude && (
                <IconButton
                  type="button"
                  onClick={() =>
                    copyToClipboard(form.location!.longitude, "lng")
                  }
                  variant="ghost"
                  title="Copy longitude"
                  icon={{
                    name: copiedField === "lng" ? "Check" : "Copy",
                    className: copiedField ? "text-green-600" : "text-gray-400",
                  }}
                />
              )
            }
          />
        </div>

        {/* Map Selection Button */}
        <IconButton
          onClick={() => setIsMapOpen(true)}
          icon={{ name: "MapPin", size: 16 }}
          text={
            hasCoordinates ? "Update Location on Map" : "Set Location on Map"
          }
          className="w-full rounded-lg py-4"
        />

        {/* Coordinate Display */}
        {hasCoordinates && (
          <div className="mt-3 p-2.5 bg-white rounded border border-brand-color-200">
            <p className="text-xs text-slate-600">
              <span className="font-medium">Coordinates:</span>{" "}
              {form.location?.latitude}, {form.location?.longitude}
            </p>
          </div>
        )}

        {/* Error Message */}
        {errors.location && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.location}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <IconButton
          onClick={() => setShowModal(false)}
          variant="outline"
          text="Cancel"
          className="rounded-lg px-4"
        />
        <IconButton
          onClick={handleSubmit}
          disabled={createBranch.isPending || updateBranch.isPending}
          text={
            createBranch.isPending || updateBranch.isPending
              ? "Saving..."
              : branchToUpdate
                ? "Update Branch"
                : "Create Branch"
          }
          className="rounded-lg px-4"
          icon={{
            name:
              createBranch.isPending || updateBranch.isPending
                ? "Loader2"
                : null,
            className: "animate-spin",
          }}
        />
      </div>

      {/* Map Modal */}
      {isMapOpen && (
        <Modal
          onClose={() => setIsMapOpen(false)}
          title={`${branchToUpdate ? "Update" : "Select"} Branch Location ${branchToUpdate ? `for ${branchToUpdate.name}` : ""}`}
        >
          <MapParent onSelectCoordinates={handleMapCoordinates} />
        </Modal>
      )}
    </div>
  );
};

export default BranchModal;
