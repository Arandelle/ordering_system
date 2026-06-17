"use client";

import { InputField } from "@/components/ui/InputField";
import { ModalType, useModalQuery } from "@/hooks/utils/useModalQuery";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ShippingErrors } from "../useFormErrors";
import { OrderFormState } from "../FormSchema";
import dynamic from "next/dynamic";
import type { ResolvedDeliveryAddress } from "./DeliveryLocationPicker";
import Modal from "@/components/ui/Modal";

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
  onChange: (type: keyof OrderFormState, field: string, value: string) => void;
  onBlur: (field: keyof ShippingErrors, value: string) => void;
  onCoordinatesChange: (
    coordinates: OrderFormState["shippingAddress"]["coordinates"],
  ) => void;
  openModal: (value: ModalType) => void;
};

const ShippingAddress = ({
  shippingAddress,
  errors,
  onChange,
  onBlur,
  onCoordinatesChange,
}: ShippingAddressProps) => {
  const addressQuery = [
    shippingAddress.line1,
    shippingAddress.line2,
    shippingAddress.city,
    shippingAddress.province,
    shippingAddress.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  const handleAddressResolved = (address: ResolvedDeliveryAddress) => {
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

  const { modal, openModal, closeModal } = useModalQuery();

  return (
    <div className="space-y-5 py-6">
      <button
        className="text-sm text-start cursor-pointer gap-2.5 bg-slate-50 border border-slate-100 px-3.5 py-3 w-full"
        onClick={() => openModal("shipping-address-coordinates")}
      >
        {!shippingAddress.coordinates ? "Pin  your Location"  : shippingAddress.coordinates?.lat}
      </button>

      {/* Line 1 & Line 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Line 1"
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
        <InputField
          label="Line 2"
          placeholder="Barangay / Subdivision"
          type="text"
          name="line2"
          value={shippingAddress.line2 ?? ""}
          onChange={(e) => onChange("shippingAddress", "line2", e.target.value)}
          onBlur={(e) => onBlur("line2", e.target.value)}
          leftIcon={<DynamicIcon name="MapPin" size={15} />}
          error={errors.line2}
          required
        />
      </div>

      {/* City & Province */}

      <InputField
        label="City"
        placeholder="e.g. Quezon City"
        type="text"
        name="city"
        value={shippingAddress.city}
        onChange={(e) => onChange("shippingAddress", "city", e.target.value)}
        onBlur={(e) => onBlur("city", e.target.value)}
        required
        leftIcon={<DynamicIcon name="Building2" size={15} />}
        error={errors.city}
      />
      <InputField
        label="Province"
        placeholder="e.g. Metro Manila"
        type="text"
        name="province"
        value={shippingAddress.province}
        onChange={(e) =>
          onChange("shippingAddress", "province", e.target.value)
        }
        onBlur={(e) => onBlur("province", e.target.value)}
        required
        leftIcon={<DynamicIcon name="Map" size={15} />}
        error={errors.province}
      />

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
          <DeliveryLocationPicker
            value={shippingAddress.coordinates}
            addressQuery={addressQuery}
            error={errors.coordinates}
            onChange={onCoordinatesChange}
            onAddressResolved={handleAddressResolved}
          />
        </Modal>
      )}
    </div>
  );
};

export default ShippingAddress;
