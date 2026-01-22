import { Truck } from "lucide-react";
import React from "react";

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
  deliveryInfo?: DeliveryInfo;
  setDeliveryInfo?: (info: DeliveryInfo) => void;
  errors?: Record<string, string>;
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
          className={`p-4 rounded-xl border-2 transition-all ${isDelivery ? "border-[#e13e00] bg-[#e13e00]/50" : "border-gray-200 hover:border-gray-300"}`}
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
      </div>
    </div>
  );
};

export default DeliveryStep;
