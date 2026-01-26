import React from 'react';
import { Banknote, Smartphone, CreditCard, Shield, AlertCircle } from 'lucide-react';

export interface PaymentInfo {
  method: 'cod' | 'gcash' | 'card';
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
  totalAmount
}) => {
  const handleMethodChange = (method: PaymentInfo['method']) => {
    setPaymentInfo({ ...paymentInfo, method });
  };

  const handleFieldChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo({ ...paymentInfo, [field]: value });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-gray-500">Choose how you want to pay</p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        {/* Cash on Delivery */}
        <button
          onClick={() => handleMethodChange('cod')}
          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
            paymentInfo.method === 'cod'
              ? 'border-[#e13e00] bg-[#e13e00]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            paymentInfo.method === 'cod' ? 'bg-[#e13e00]/20' : 'bg-gray-100'
          }`}>
            <Banknote size={24} className={paymentInfo.method === 'cod' ? 'text-[#e13e00]' : 'text-gray-400'} />
          </div>
          <div className="text-left flex-1">
            <h3 className={`font-semibold ${paymentInfo.method === 'cod' ? 'text-[#e13e00]' : 'text-gray-700'}`}>
              Cash on Delivery
            </h3>
            <p className="text-sm text-gray-500">Pay when you receive your order</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            paymentInfo.method === 'cod' ? 'border-[#e13e00]' : 'border-gray-300'
          }`}>
            {paymentInfo.method === 'cod' && (
              <div className="w-3 h-3 rounded-full bg-[#e13e00]" />
            )}
          </div>
        </button>

        {/* GCash */}
        <button
          onClick={() => handleMethodChange('gcash')}
          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
            paymentInfo.method === 'gcash'
              ? 'border-[#e13e00] bg-[#e13e00]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            paymentInfo.method === 'gcash' ? 'bg-[#e13e00]/20' : 'bg-gray-100'
          }`}>
            <Smartphone size={24} className={paymentInfo.method === 'gcash' ? 'text-[#e13e00]' : 'text-gray-400'} />
          </div>
          <div className="text-left flex-1">
            <h3 className={`font-semibold ${paymentInfo.method === 'gcash' ? 'text-[#e13e00]' : 'text-gray-700'}`}>
              GCash
            </h3>
            <p className="text-sm text-gray-500">Pay using your GCash wallet</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            paymentInfo.method === 'gcash' ? 'border-[#e13e00]' : 'border-gray-300'
          }`}>
            {paymentInfo.method === 'gcash' && (
              <div className="w-3 h-3 rounded-full bg-[#e13e00]" />
            )}
          </div>
        </button>

        {/* GCash Number Input */}
        {paymentInfo.method === 'gcash' && (
          <div className="pl-16 pr-4 pb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">GCash Number *</label>
            <input
              type="tel"
              value={paymentInfo.gcashNumber || ''}
              onChange={(e) => handleFieldChange('gcashNumber', e.target.value)}
              placeholder="09XX XXX XXXX"
              maxLength={11}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.gcashNumber ? 'border-red-500' : 'border-gray-200'
              } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
            />
            {errors.gcashNumber && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.gcashNumber}
              </p>
            )}
          </div>
        )}

        {/* Credit/Debit Card */}
        <button
          onClick={() => handleMethodChange('card')}
          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
            paymentInfo.method === 'card'
              ? 'border-[#e13e00] bg-[#e13e00]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            paymentInfo.method === 'card' ? 'bg-[#e13e00]/20' : 'bg-gray-100'
          }`}>
            <CreditCard size={24} className={paymentInfo.method === 'card' ? 'text-[#e13e00]' : 'text-gray-400'} />
          </div>
          <div className="text-left flex-1">
            <h3 className={`font-semibold ${paymentInfo.method === 'card' ? 'text-[#e13e00]' : 'text-gray-700'}`}>
              Credit / Debit Card
            </h3>
            <p className="text-sm text-gray-500">Visa, Mastercard, JCB</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            paymentInfo.method === 'card' ? 'border-[#e13e00]' : 'border-gray-300'
          }`}>
            {paymentInfo.method === 'card' && (
              <div className="w-3 h-3 rounded-full bg-[#e13e00]" />
            )}
          </div>
        </button>

        {/* Card Details Input */}
        {paymentInfo.method === 'card' && (
          <div className="pl-4 pr-4 pb-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name *</label>
              <input
                type="text"
                value={paymentInfo.cardName || ''}
                onChange={(e) => handleFieldChange('cardName', e.target.value)}
                placeholder="JUAN DELA CRUZ"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.cardName ? 'border-red-500' : 'border-gray-200'
                } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all uppercase`}
              />
              {errors.cardName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.cardName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
              <input
                type="text"
                value={paymentInfo.cardNumber || ''}
                onChange={(e) => handleFieldChange('cardNumber', formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-200'
                } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.cardNumber}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input
                  type="text"
                  value={paymentInfo.cardExpiry || ''}
                  onChange={(e) => handleFieldChange('cardExpiry', formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.cardExpiry ? 'border-red-500' : 'border-gray-200'
                  } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
                />
                {errors.cardExpiry && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.cardExpiry}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                <input
                  type="password"
                  value={paymentInfo.cardCvv || ''}
                  onChange={(e) => handleFieldChange('cardCvv', e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  maxLength={4}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.cardCvv ? 'border-red-500' : 'border-gray-200'
                  } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
                />
                {errors.cardCvv && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.cardCvv}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        <Shield size={16} className="text-green-500" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Total Amount */}
      <div className="bg-[#e13e00]/5 border border-[#e13e00]/20 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Amount to Pay</span>
          <span className="text-2xl font-bold text-[#e13e00]">₱{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Navigation Buttons */}
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
