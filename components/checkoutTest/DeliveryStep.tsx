import React from 'react';
import { Truck, MapPin, Clock, AlertCircle } from 'lucide-react';

export interface DeliveryInfo {
  type: 'delivery' | 'pickup';
  fullName: string;
  phone: string;
  address: string;
  city: string;
  barangay: string;
  landmark: string;
  instructions: string;
}

interface DeliveryStepProps {
  deliveryInfo: DeliveryInfo;
  setDeliveryInfo: (info: DeliveryInfo) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onBack: () => void;
}

const DeliveryStep: React.FC<DeliveryStepProps> = ({ 
  deliveryInfo, 
  setDeliveryInfo, 
  errors,
  onNext, 
  onBack 
}) => {
  const handleChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo({ ...deliveryInfo, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Options</h2>
        <p className="text-gray-500">Choose how you want to receive your order</p>
      </div>

      {/* Delivery Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleChange('type', 'delivery')}
          className={`p-4 rounded-xl border-2 transition-all ${
            deliveryInfo.type === 'delivery'
              ? 'border-[#e13e00] bg-[#e13e00]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Truck size={24} className={deliveryInfo.type === 'delivery' ? 'text-[#e13e00]' : 'text-gray-400'} />
          <h3 className={`font-semibold mt-2 ${deliveryInfo.type === 'delivery' ? 'text-[#e13e00]' : 'text-gray-700'}`}>
            Delivery
          </h3>
          <p className="text-sm text-gray-500 mt-1">30-45 mins</p>
        </button>

        <button
          onClick={() => handleChange('type', 'pickup')}
          className={`p-4 rounded-xl border-2 transition-all ${
            deliveryInfo.type === 'pickup'
              ? 'border-[#e13e00] bg-[#e13e00]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <MapPin size={24} className={deliveryInfo.type === 'pickup' ? 'text-[#e13e00]' : 'text-gray-400'} />
          <h3 className={`font-semibold mt-2 ${deliveryInfo.type === 'pickup' ? 'text-[#e13e00]' : 'text-gray-700'}`}>
            Pickup
          </h3>
          <p className="text-sm text-gray-500 mt-1">15-20 mins</p>
        </button>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Contact Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={deliveryInfo.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="Juan dela Cruz"
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.fullName ? 'border-red-500' : 'border-gray-200'
            } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input
            type="tel"
            value={deliveryInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+63 912 345 6789"
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.phone ? 'border-red-500' : 'border-gray-200'
            } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Delivery Address (only for delivery) */}
      {deliveryInfo.type === 'delivery' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Delivery Address</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              value={deliveryInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main Street, Building/Unit"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.address ? 'border-red-500' : 'border-gray-200'
              } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                value={deliveryInfo.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Makati City"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.city ? 'border-red-500' : 'border-gray-200'
                } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.city}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barangay *</label>
              <input
                type="text"
                value={deliveryInfo.barangay}
                onChange={(e) => handleChange('barangay', e.target.value)}
                placeholder="Poblacion"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.barangay ? 'border-red-500' : 'border-gray-200'
                } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
              />
              {errors.barangay && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.barangay}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
            <input
              type="text"
              value={deliveryInfo.landmark}
              onChange={(e) => handleChange('landmark', e.target.value)}
              placeholder="Near the church, beside 7-Eleven"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions (Optional)</label>
            <textarea
              value={deliveryInfo.instructions}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Leave at the gate, ring the doorbell, etc."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all resize-none"
            />
          </div>
        </div>
      )}

      {/* Pickup Info */}
      {deliveryInfo.type === 'pickup' && (
        <div className="bg-[#e13e00]/5 border border-[#e13e00]/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-[#e13e00] flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900">Pickup Location</h4>
              <p className="text-gray-600 text-sm mt-1">
                Harrison – House of Inasal & BBQ<br />
                123 Harrison Street, Bacolod City<br />
                Negros Occidental 6100
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Ready in 15-20 minutes</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default DeliveryStep;
