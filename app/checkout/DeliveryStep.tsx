import { AlertCircle, Form, MapPin, Truck } from "lucide-react";
import React from "react";

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "tel" | "email";
  placeholder?: string;
  required?: boolean;
}

export const FormInput = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required = false,
}: FormInputProps) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-[550] text-gray-600 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border ${error ? "border-red-500" : "border-gray-200"} focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  rows = 3,
  required = false,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-[550] text-gray-700 mb-1"
      >
        {label} {required && "*"}
      </label>
      <textarea
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl border ${
          error ? "border-red-500" : "border-gray-200"
        } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all resize-none`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

export interface DeliveryInfo {
  type: "delivery" | "pickup";
  fullname: string;
  phone: string;
  address: string;
  city: string;
  barangay: string;
  landmark: string;
  instructions: string;
}

interface DeliveryInfoProps {
  deliveryInfo: DeliveryInfo;
  setDeliveryInfo: (info: DeliveryInfo) => void;
  errors: Record<string, string>;
  onNext?: () => void;
  onBack?: () => void;
}

const DeliveryStep = ({
  deliveryInfo,
  setDeliveryInfo,
  errors,
  onNext,
  onBack,
}: DeliveryInfoProps) => {
  const isDelivery = deliveryInfo?.type === "delivery";

  const handleChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo({ ...deliveryInfo, [field]: value });
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Delivery Options
        </h2>
        <p className="text-gray-500">
          Choose how you want to receive your order
        </p>
      </div>

      {/** Delivery Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleChange("type", "delivery")}
          className={`p-4 rounded-xl border transition-all ${isDelivery ? "border-[#e13e00] bg-[#e13e00]/5" : "border-gray-200 hover:border-gray-300"}`}
        >
          <Truck
            size={24}
            className={isDelivery ? "text-[#e13e00]" : "text-gray-400"}
          />
          <h3
            className={`font-semibold mt-2 ${isDelivery ? "text-[#e13e00]" : "text-gray-700"}`}
          >
            Delivery
          </h3>
          <p className="text-sm text-gray-500 mt-1">30-45 mins</p>
        </button>
        <button
          onClick={() => handleChange("type", "pickup")}
          className={`p-4 cursor-pointer rounded-xl border transition-all ${!isDelivery ? "border-[#e13e00] bg-[#e13e00]/5" : "border-gray-200 hover:border-gray-300"}`}
        >
          <MapPin
            size={24}
            className={!isDelivery ? "text-[#e13e00]" : "text-gray-400"}
          />
          <h3
            className={`font-semibold mt-2 ${!isDelivery ? "text-[#e13e00]" : "text-gray-700"}`}
          >
            Pickup
          </h3>
          <p className="text-sm text-gray-500 mt-1">15-20 mins</p>
        </button>
      </div>

      {/**Contact Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Contact Information</h3>
        <FormInput
          label="Full name"
          name="fullname"
          value={deliveryInfo.fullname}
          onChange={(value) => handleChange("fullname", value)}
          error={errors.fullname}
          placeholder="Enter your full name"
          required
        />

        <FormInput
          label="Phone"
          name="phone"
          value={deliveryInfo.phone}
          onChange={(value) => handleChange("phone", value)}
          error={errors.phone}
          placeholder="Enter your phone number"
          required
        />

        {/** Delivery Address */}
        {deliveryInfo.type === "delivery" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Delivery Address</h3>
            <FormInput
              label="Street Address"
              name="address"
              value={deliveryInfo.address}
              onChange={(value) => handleChange("address", value)}
              error={errors.address}
              placeholder="123 Main Street, Building/Unit"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="City"
                name="city"
                value={deliveryInfo.city}
                onChange={(value) => handleChange("city", value)}
                error={errors.city}
                placeholder="Makati City"
                required
              />

              <FormInput
                label="Barangay"
                name="barangay"
                value={deliveryInfo.barangay}
                onChange={(value) => handleChange("barangay", value)}
                error={errors.barangay}
                placeholder="Poblacion"
                required
              />
            </div>

            <FormInput
              label="Landmark (Optional)"
              name="landmark"
              value={deliveryInfo.landmark}
              onChange={(value) => handleChange("landmark", value)}
              placeholder="Near the church, beside 7-Eleven"
            />
            <FormTextarea
              label="Delivery Instructions (Optional)"
              name="instructions"
              value={deliveryInfo.instructions}
              onChange={(value) => handleChange("instructions", value)}
              placeholder="Leave at the gate, ring the doorbell, etc."
              rows={2}
            />
          </div>
        )}
      </div>

      {/** Navigation button */}
      <div className="flex gap-4">
        <button onClick={onBack} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-colors">Back</button>
        <button onClick={onNext} className="flex-1 bg-[#e13e00] hover:[#c13500] text-white py-4 rounded-xl rounded-xl font-bold transition-colors">Continue to Payment</button>
      </div>
    </div>
  );
};

export default DeliveryStep;
