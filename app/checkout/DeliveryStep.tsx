import { Clock, MapPin, Truck } from "lucide-react";
import { FormInput } from "@/components/form/FormInput";
import { FormTextarea } from "@/components/form/FormTextArea";

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
    delete errors[field]
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
          className={`p-4 rounded-xl border transition-all ${isDelivery ? "border-[#e13e00] bg-[#e13e00]/5" : "border-gray-200 hover:border-gray-300 cursor-pointer"}`}
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
          onChange={(e) => handleChange("fullname", e.target.value)}
          error={errors.fullname}
          placeholder="Enter your full name"
          required
        />

        <FormInput
          label="Phone"
          name="phone"
          value={deliveryInfo.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
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
              onChange={(e) => handleChange("address", e.target.value)}
              error={errors.address}
              placeholder="123 Main Street, Building/Unit"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="City"
                name="city"
                value={deliveryInfo.city}
                onChange={(e) => handleChange("city", e.target.value)}
                error={errors.city}
                placeholder="Makati City"
                required
              />

              <FormInput  
                label="Barangay"
                name="barangay"
                value={deliveryInfo.barangay}
                onChange={(e) => handleChange("barangay", e.target.value)}
                error={errors.barangay}
                placeholder="Poblacion"
                required
              />
            </div>

            <FormInput
              label="Landmark (Optional)"
              name="landmark"
              value={deliveryInfo.landmark}
              onChange={(e) => handleChange("landmark", e.target.value)}
              placeholder="Near the church, beside 7-Eleven"
            />
            <FormTextarea
              label="Delivery Instructions (Optional)"
              name="instructions"
              value={deliveryInfo.instructions}
              onChange={(e) => handleChange("instructions", e)}
              placeholder="Leave at the gate, ring the doorbell, etc."
              rows={2}
            />
          </div>
        )}
      </div>

      {deliveryInfo.type === 'pickup' && (
        <div className="bg-[#e13e00]/5 border border-[#e13e00]/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-[#e13e00] flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900">Pickup Location</h4>
              <p className="text-gray-600 text-sm mt-1">
                Harrison – House of Inasal & BBQ<br />
                Century Mall, Makati City<br />
                Philippines
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Ready in 15-20 minutes</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/** Navigation button */}
      <div className="flex gap-4">
        <button onClick={onBack} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-colors cursor-pointer">Back</button>
        <button onClick={onNext} className="flex-1 bg-[#e13e00] hover:bg-[#c13500] text-white py-4 rounded-xl rounded-xl font-bold transition-colors cursor-pointer">Continue to Payment</button>
      </div>
    </div>
  );
};

export default DeliveryStep;
