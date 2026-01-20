import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { DeliveryInfo } from './DeliveryStep';
import { PaymentInfo } from './PaymentStep';
import { MapPin, Phone, User, CreditCard, Truck, Clock, Edit2 } from 'lucide-react';

interface ConfirmationStepProps {
  deliveryInfo: DeliveryInfo;
  paymentInfo: PaymentInfo;
  deliveryFee: number;
  onConfirm: () => void;
  onBack: () => void;
  onEditDelivery: () => void;
  onEditPayment: () => void;
  isProcessing: boolean;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  deliveryInfo,
  paymentInfo,
  deliveryFee,
  onConfirm,
  onBack,
  onEditDelivery,
  onEditPayment,
  isProcessing
}) => {
  const { cartItems, totalPrice } = useCart();

  const getPaymentMethodLabel = () => {
    switch (paymentInfo.method) {
      case 'cod':
        return 'Cash on Delivery';
      case 'gcash':
        return `GCash (${paymentInfo.gcashNumber})`;
      case 'card':
        return `Card ending in ${paymentInfo.cardNumber?.slice(-4)}`;
      default:
        return '';
    }
  };

  const estimatedTime = deliveryInfo.type === 'delivery' ? '30-45 minutes' : '15-20 minutes';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Review Your Order</h2>
        <p className="text-gray-500">Please confirm all details before placing your order</p>
      </div>

      {/* Order Items */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Order Items ({cartItems.length})</h3>
        <div className="space-y-3">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
              </div>
              <span className="font-semibold text-gray-900">₱{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">
            {deliveryInfo.type === 'delivery' ? 'Delivery Details' : 'Pickup Details'}
          </h3>
          <button 
            onClick={onEditDelivery}
            className="text-[#e13e00] text-sm font-medium flex items-center gap-1 hover:underline"
          >
            <Edit2 size={14} /> Edit
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User size={16} className="text-gray-400" />
            <span>{deliveryInfo.fullName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} className="text-gray-400" />
            <span>{deliveryInfo.phone}</span>
          </div>
          {deliveryInfo.type === 'delivery' ? (
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span>
                {deliveryInfo.address}, {deliveryInfo.barangay}, {deliveryInfo.city}
                {deliveryInfo.landmark && <><br />Landmark: {deliveryInfo.landmark}</>}
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span>
                Harrison – House of Inasal & BBQ<br />
                123 Harrison Street, Bacolod City
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-gray-400" />
            <span>Estimated: {estimatedTime}</span>
          </div>
        </div>

        {deliveryInfo.instructions && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Instructions:</span> {deliveryInfo.instructions}
            </p>
          </div>
        )}
      </div>

      {/* Payment Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Payment Method</h3>
          <button 
            onClick={onEditPayment}
            className="text-[#e13e00] text-sm font-medium flex items-center gap-1 hover:underline"
          >
            <Edit2 size={14} /> Edit
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <CreditCard size={16} className="text-gray-400" />
          <span>{getPaymentMethodLabel()}</span>
        </div>
      </div>

      {/* Order Total */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 text-white">
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal</span>
            <span>₱{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? 'Free' : `₱${deliveryFee.toFixed(2)}`}</span>
          </div>
        </div>
        <div className="border-t border-white/20 pt-3 flex justify-between items-center">
          <span className="font-semibold">Total Amount</span>
          <span className="text-2xl font-bold text-[#e13e00]">₱{(totalPrice + deliveryFee).toFixed(2)}</span>
        </div>
      </div>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        By placing this order, you agree to our Terms of Service and Privacy Policy.
      </p>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold transition-colors"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="flex-1 bg-[#e13e00] hover:bg-[#c13500] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Truck size={20} />
              Place Order
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
