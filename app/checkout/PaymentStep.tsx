import { AlertCircle, Banknote, Smartphone } from "lucide-react";
import React from "react";

export interface PaymentInfo {
  method: "cod" | "gcash" | "card";
  gcashNumber?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardName?: string;
}

interface PaymentStepProps {
  paymentInfo: PaymentInfo;
  setPaymentInfo: (info: PaymentInfo) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onBack: () => void;
  totalAmount: number;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentInfo,
  setPaymentInfo,
  errors,
  onNext,
  onBack,
  totalAmount,
}) => {
  const handleFieldChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo({
      ...paymentInfo,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-gray-500">Choose how you want to pay</p>
      </div>

      {/** Payment methods */}
      <div className="space-y-3">
        {/** Cash on delivery */}
        <button
          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center`}
          >
            <Banknote size={24} className="" />
          </div>
          <div className="text-left flex-1">
            <h3 className={`font-semibold`}>Cash on delivery</h3>
            <p className="text-sm text-gray-500">
              Pay when you recieved your order
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center`}
          >
            <div className="w-3 h-3 rounded-full bg-[#e13e00]" />
          </div>
        </button>

        {/** Gcash */}
        <button
          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap4`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center`}
          >
            <Smartphone size={24} />
          </div>
          <div className="text-left flex-1">
            <h3 className={`font-semibold`}>Gcash</h3>
            <p className="text-sm text-gray-500">Pay using your Gcash wallet</p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center`}
          >
            <div className="w-3 h-3 rounded-full bg-[#e13e00]" />
          </div>
        </button>

        {/** Gcash number input */}
        {paymentInfo.method === "gcash" && (
          <div className="pl-16 pr-4 pb-2">
            <label
              htmlFor="gcash"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gcash Number *
            </label>
            <input
              type="tel"
              name="gcash"
              id="gcash"
              value={paymentInfo.gcashNumber || ""}
              onChange={(e) => handleFieldChange("gcashNumber", e.target.value)}
              placeholder="09XX-XXX-XXXX"
              maxLength={11}
              className={`w-full px-4 py-3 rounded-xl border ${errors.gcashNumber ? "border-red-500" : "border-gray-200"} focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00] outline-none transition-colors`}
            />
            {errors.gcashNumber && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={24} />
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;
