import React, { useState } from "react";
import { DeliveryInfo } from "./DeliveryStep";
import { PaymentInfo } from "./PaymentStep";
import { useCart } from "@/contexts/CartContext";
import { Check, Clock, CreditCard, Edit2, MapPin, Phone, Truck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrder } from "@/contexts/OrderContext";
import { OrderType } from "@/types/OrderTypes";

interface ConfirmationStepProps {
  deliveryInfo: DeliveryInfo;
  paymentInfo: PaymentInfo;
  deliveryFee: number;
  onNext: () => void;
  onBack: () => void;
  onEditDelivery: () => void;
  onEditPayment: () => void;
  currentStep: string
}

const ConfirmationStep = ({
  deliveryInfo,
  paymentInfo,
  deliveryFee,
  onNext,
  onBack,
  onEditDelivery,
  onEditPayment,
  currentStep
}: ConfirmationStepProps) => {
  const router = useRouter();

  const {addOrder} = useOrder();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('')
  const { cartItems, totalPrice, clearCart } = useCart();
   const totalAmount = totalPrice + deliveryFee;

  const {
    type,
    fullname,
    phone,
    address,
    city,
    barangay,
    landmark,
    instructions,
  } = deliveryInfo;

  const { method, gcashNumber, cardNumber } =
    paymentInfo;

  const getPaymentMethodLabel = () => {
    switch (method) {
      case "cod":
        return "Cash on Delivery";
      case "gcash":
        return `GCash (${gcashNumber})`;
      case "card":
        return `Card ending in ${cardNumber?.slice(-4)}`;
      default:
        return "";
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HRS-${timestamp}-${random}`;
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newOrderNumber = generateOrderNumber();

    const order: OrderType = {
      id: newOrderNumber,
      createdAt: new Date().toISOString(),
      status:  paymentInfo.method !== 'gcash' ? "pending" : "paid",

      items: cartItems,
      deliveryInfo,
      paymentInfo: {
        method: paymentInfo.method,
        label: getPaymentMethodLabel()
      },

      totals: {
        subTotal: totalPrice,
        deliveryFee,
        total: totalAmount
      },

      estimatedTime
    }

    setOrderNumber(newOrderNumber);
    addOrder(order);
    clearCart();
    setIsProcessing(false);
    onNext();
    window.scrollTo(0, 0);
  } 

  const estimatedTime = type === "delivery" ? "30-45 minutes" : "15-20 minutes";

     // Success Page
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            {/* Success Animation */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
              <Check size={48} className="text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-500 mb-6">Salamat! Your order is being prepared.</p>
            
            {/* Order Number */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Order Tracking Number</p>
              <p className="text-xl font-bold text-[#e13e00] font-mono">{orderNumber}</p>
            </div>
            
            {/* Order Details */}
            <div className="bg-[#e13e00]/5 border border-[#e13e00]/20 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Type</span>
                  <span className="font-medium capitalize">{deliveryInfo.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated Time</span>
                  <span className="font-medium">{estimatedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium capitalize">
                    {paymentInfo.method === 'cod' ? 'Cash on Delivery' : 
                     paymentInfo.method === 'gcash' ? 'GCash' : 'Credit Card'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#e13e00]/20">
                  <span className="text-gray-900 font-semibold">Total Amount</span>
                  <span className="font-bold text-[#e13e00]">₱{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Delivery/Pickup Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                {deliveryInfo.type === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
              </h3>
              {deliveryInfo.type === 'delivery' ? (
                <p className="text-sm text-gray-600">
                  {fullname}<br />
                  {address}, {barangay}<br />
                  {city}<br />
                  {phone}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Harrison – House of Inasal & BBQ<br />
                 Century Mall, Makati City<br />
                 Philippines
                </p>
              )}
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-[#e13e00] hover:bg-[#c13500] text-white py-4 rounded-xl font-bold transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
              >
                Order More
              </button>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes bounce-once {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .animate-bounce-once {
            animation: bounce-once 0.5s ease-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Review your Order
        </h2>
        <p className="text-gray-500">
          Please confirm all details before placing your order
        </p>
      </div>

      {/** Order Items */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Order Items ({cartItems.length})
        </h3>
        <div className="space-y-3">
          {cartItems.map((item) => (
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
              <span className="font-semibold text-gray-900">
                ₱{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/** Delivery Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">
            {type === "delivery" ? "Delivery Details" : "Pickup Details"}
          </h3>
          <button
            onClick={onEditDelivery}
            className="text-[#e13e00] text-sm font-[550] flex items-center gap-1 hover:underline"
          >
            <Edit2 size={14} /> Edit
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User size={16} className="text-gray-400" />
            <span>{fullname}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} className="text-gray-400" />
            <span>{phone}</span>
          </div>
          {type === "delivery" ? (
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin size={16} className="text-gray-400" />
              <span>
                {address}, {barangay}, {city}
                {landmark && (
                  <>
                    <br /> Landmark: {landmark}
                  </>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin
                size={16}
                className="text-gray-400 flex-shrink-0 mt-0.5"
              />
              <span>
                Harrison - House of Inasal BBQ <br />
                Century Mall, Makati City
              </span>
            </div>
          )}
          
        </div>

        <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-gray-400" />
            <span>Estimated: {estimatedTime}</span>
          </div>
          {instructions && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                <span className="font-[550]">Instruction: </span>
                {instructions}
              </p>
            </div>
          )}
      </div>

       {/** Payment Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Payment Method</h3>
            <button
              onClick={onEditPayment}
              className="text-[#e13e00] text-sm font-[550] flex items-center gap-1 hover:underline"
            >
              <Edit2 size={14} /> Edit
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard size={16} className="text-gray-400" />
            <span>{getPaymentMethodLabel()}</span>
          </div>
        </div>

        {/** Order Total */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 text-white">
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal</span>
              <span>₱{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Delivery Fee</span>
              <span>
                {deliveryFee === 0 ? "Free" : `₱${deliveryFee.toFixed(2)}`}
              </span>
            </div>
          </div>
          <div className="border-t border-white/20 pt-3 flex justify-between items-center">
            <span className="font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-[#e13e00]">
              ₱{(totalPrice + deliveryFee).toFixed(2)}
            </span>
          </div>
        </div>
        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By placing this order, you agree to our Terms of Service and Privacy
          Policy.
        </p>

        {/** Navigation buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => handlePlaceOrder()}
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
