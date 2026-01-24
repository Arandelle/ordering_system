import React from "react";
import { Banknote, CreditCard, Shield, Smartphone } from "lucide-react";
import { FormInput } from "@/components/form/FormInput";
import PaymentButton from "@/components/ui/PaymentButton";

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

  const handleMethodChange = (method: PaymentInfo["method"]) => {
    setPaymentInfo({
      ...paymentInfo,
      method,
    });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4){
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2){
      return v.substring(0,2) + '/' + v.substring(2,4);
    }

    return v;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-gray-500">Choose how you want to pay</p>
      </div>

      {/** Payment methods */}
      <div className="space-y-4">
        {/** Cash on delivery */}
        <PaymentButton
          method="Cash on Delivery"
          isActive={paymentInfo.method === "cod"}
          subTitle="Pay when you receive your order"
          handleMethodChange={() => handleMethodChange("cod")}
          icon={Banknote}
        />

        {/** Gcash */}
        <PaymentButton
          method="Gcash"
          isActive={paymentInfo.method === "gcash"}
          subTitle="Pay using your GCash wallet"
          handleMethodChange={() => handleMethodChange("gcash")}
          icon={Smartphone}
        />

        {/** Gcash number input */}
        {paymentInfo.method === "gcash" && (
          <div className="px-4 pb-2">
            <FormInput
              label="Gcash Number"
              name="gcashNumber"
              value={paymentInfo.gcashNumber || ""}
              onChange={(e) => handleFieldChange("gcashNumber", e.target.value)}
              error={errors.gcashNumber}
              type="tel"
              placeholder="09XX XXX XXXX"
              required
            />
          </div>
        )}

        {/**Credit/Debit Card */}
        <PaymentButton
          method="Credit/Debit Card"
          isActive={paymentInfo.method === "card"}
          subTitle="Visa, Mastercard, JCB"
          handleMethodChange={() => handleMethodChange("card")}
          icon={CreditCard}
        />

        {paymentInfo.method == "card" && (
          <div className="px-4 pb-2 space-y-4">
            <FormInput
              label="Cardholder Name"
              name="cardName"
              value={paymentInfo.cardName || ""}
              onChange={(e) => handleFieldChange("cardName", e.target.value)}
              error={errors.cardName}
              placeholder="Juan Dela Cruz"
              required
            />

            <FormInput
              label="Card Number"
              name="cardNumber"
              value={paymentInfo.cardNumber || ''}
              onChange={(e) => handleFieldChange("cardNumber", formatCardNumber(e.target.value))}
              error={errors.cardNumber}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Expiry Date"
                name="cardExpiry"
                value={paymentInfo.cardExpiry || ""}
                onChange={(e) =>
                  handleFieldChange("cardExpiry", formatExpiry(e.target.value))
                }
                error={errors.cardExpiry}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
              <FormInput
                label="CVV"
                name="cardCvv"
                value={paymentInfo.cardCvv || ""}
                onChange={(e) =>
                  handleFieldChange(
                    "cardCvv",
                    e.target.value.replace(/\D/g, ""),
                  )
                }
                error={errors.cardCvv}
                placeholder="123"
                type="password"
                maxLength={4}
                required
              />
            </div>
          </div>
        )}
      </div>

      {/** Security Note */}
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        <Shield size={16} className="text-green-500" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/** Total Amount */}
      <div className="bg-[#e13e00]/5 border border-[#e13e00]/20 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Amount to Pay</span>
          <span className="text-2xl font-bold text-[#e13e00]">
            ₱{totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/** Navigation buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-[#e13e00] hover:bg-[#c13500] text-white py-4 rounded-xl font-bold transition-colors"
        >
          Review Order
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;
