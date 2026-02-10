import React, { useState } from "react";
import { DeliveryInfo } from "./DeliveryStep";
import { PaymentInfo } from "./PaymentStep";
import { useCart } from "@/contexts/CartContext";
import {
  Check,
  Clock,
  CreditCard,
  Edit2,
  MapPin,
  Phone,
  Truck,
  User,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrder } from "@/contexts/OrderContext";
import { OrderType } from "@/types/OrderTypes";
import { toast } from "sonner";

interface ConfirmationStepProps {
  deliveryInfo: DeliveryInfo;
  paymentInfo: PaymentInfo;
  onNext: () => void;
  onBack: () => void;
  onEditDelivery: () => void;
  onEditPayment: () => void;
  currentStep: string;
}

const ConfirmationStep = ({
  deliveryInfo,
  paymentInfo,
  onNext,
  onBack,
  onEditDelivery,
  onEditPayment,
  currentStep,
}: ConfirmationStepProps) => {
  const router = useRouter();

  const { addOrder } = useOrder();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const { cartItems, totalPrice, clearCart } = useCart();
  const totalAmount = totalPrice

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

  const { method, gcashNumber, cardNumber } = paymentInfo;

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

    try {
      // FRONTEND VALIDATION - Check minimum amount before API call
      const MINIMUM_AMOUNT = 100;
      
      if (totalAmount < MINIMUM_AMOUNT) {
        toast.error("Minimum Order Amount", {
          description: `Your order total is ₱${totalAmount.toFixed(2)}. The minimum amount for online payment is ₱${MINIMUM_AMOUNT.toFixed(2)}. Please add more items to your cart.`,
          duration: 6000,
        });
        setIsProcessing(false);
        return;
      }

      // Call PayMongo API to create payment link
      const response = await fetch("/api/paymongo/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(totalAmount),
          description: deliveryInfo.instructions.trim() || `Harrison BBQ Order - ${new Date().toLocaleDateString()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Parse user-friendly error messages from PayMongo
        let userMessage = "Unable to create payment link. Please try again.";
        
        if (data.error?.errors && Array.isArray(data.error.errors)) {
          const errorDetails = data.error.errors[0];
          
          // Handle specific PayMongo error codes
          switch (errorDetails.code) {
            case "parameter_below_minimum":
              userMessage = `Order amount is below the minimum requirement of ₱100.00. Please add more items to your cart.`;
              break;
            case "parameter_above_maximum":
              userMessage = `Order amount exceeds the maximum limit. Please contact support.`;
              break;
            case "parameter_invalid":
              userMessage = `Invalid payment details. Please check your information and try again.`;
              break;
            case "authentication_failed":
              userMessage = `Payment service is temporarily unavailable. Please try again later or contact support.`;
              break;
            default:
              // Show the actual error detail if it's user-friendly
              if (errorDetails.detail && errorDetails.detail.length < 100) {
                userMessage = errorDetails.detail;
              }
          }
        } else if (data.error) {
          // Fallback for simple error messages
          userMessage = typeof data.error === 'string' ? data.error : userMessage;
        }
        
        toast.error("Payment Error", {
          description: userMessage,
          duration: 6000,
        });
        
        throw new Error(userMessage);
      }

      // Validate the response has the checkout_url
      if (!data.checkout_url) {
        throw new Error("Payment link was not generated. Please try again or contact support.");
      }

      // Simulate order processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newOrderNumber = generateOrderNumber();
      const estimatedTime = type === "delivery" ? "30-45 minutes" : "15-20 minutes";

      const order: OrderType = {
        id: newOrderNumber,
        createdAt: new Date().toISOString(),
        status: paymentInfo.method === "cod" ? "pending" : "paid",
        items: cartItems,
        deliveryInfo,
        paymentInfo: {
          method: paymentInfo.method,
          label: getPaymentMethodLabel(),
        },
        totals: {
          subTotal: totalPrice,
          total: totalAmount,
        },
        estimatedTime,
      };

      // Save checkout URL and order number
      setCheckoutUrl(data.checkout_url);
      setOrderNumber(newOrderNumber);
      addOrder(order);
      clearCart();

      onNext();
      window.scrollTo(0, 0);
    } catch (error: any) {
      // Error already shown via toast
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const estimatedTime = type === "delivery" ? "30-45 minutes" : "15-20 minutes";

  // Check if order meets minimum for online payment
  const MINIMUM_AMOUNT = 100;
  const meetsMinimum = totalAmount >= MINIMUM_AMOUNT;

  // Success Page
  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            {/* Success Animation */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
              <Check size={48} className="text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-500 mb-6">
              Salamat! Your order is being prepared.
            </p>

            {/* Order Number */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">
                Order Tracking Number
              </p>
              <p className="text-xl font-bold text-[#e13e00] font-mono">
                {orderNumber}
              </p>
            </div>

            {/* Payment Link - Only show if not COD */}
            {paymentInfo.method !== "cod" && checkoutUrl && (
              <div className="bg-[#e13e00]/10 border-2 border-[#e13e00] rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                  <CreditCard size={20} className="text-[#e13e00]" />
                  Complete Your Payment
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click the button below to proceed with your payment
                </p>
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#e13e00] hover:bg-[#c13500] text-white py-4 px-6 rounded-xl font-bold transition-colors"
                >
                  Pay Now - ₱{totalAmount.toFixed(2)}
                  <ExternalLink size={18} />
                </a>
                <p className="text-xs text-gray-500 mt-3">
                  Secure payment powered by PayMongo
                </p>
              </div>
            )}

            {/* Order Details */}
            <div className="bg-[#e13e00]/5 border border-[#e13e00]/20 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">
                Order Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Type</span>
                  <span className="font-medium capitalize">
                    {deliveryInfo.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated Time</span>
                  <span className="font-medium">{estimatedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium capitalize">
                    {paymentInfo.method === "cod"
                      ? "Cash on Delivery"
                      : paymentInfo.method === "gcash"
                        ? "GCash"
                        : "Credit Card"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#e13e00]/20">
                  <span className="text-gray-900 font-semibold">
                    Total Amount
                  </span>
                  <span className="font-bold text-[#e13e00]">
                    ₱{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery/Pickup Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                {deliveryInfo.type === "delivery"
                  ? "Delivery Address"
                  : "Pickup Location"}
              </h3>
              {deliveryInfo.type === "delivery" ? (
                <p className="text-sm text-gray-600">
                  {fullname}
                  <br />
                  {address}, {barangay}
                  <br />
                  {city}
                  <br />
                  {phone}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Harrison – House of Inasal & BBQ
                  <br />
                  Century Mall, Makati City
                  <br />
                  Philippines
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => router.push("/orders")}
                className="w-full bg-[#e13e00] hover:bg-[#c13500] text-white py-4 rounded-xl font-bold transition-colors"
              >
                View Order Details
              </button>
              <button
                onClick={() => router.push("/")}
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

      {/* Minimum Amount Warning - Only for online payment */}
      {paymentInfo.method !== "cod" && !meetsMinimum && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-1">
              Minimum Order Amount Required
            </h4>
            <p className="text-sm text-amber-700">
              Online payment requires a minimum order of ₱{MINIMUM_AMOUNT.toFixed(2)}. 
              Your current total is ₱{totalAmount.toFixed(2)}. 
              Please add ₱{(MINIMUM_AMOUNT - totalAmount).toFixed(2)} more to proceed, 
              or select Cash on Delivery as your payment method.
            </p>
          </div>
        </div>
      )}

      {/** Order Items */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Order Items ({cartItems.length})
        </h3>
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center gap-3">
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
        </div>
        <div className="border-t border-white/20 pt-3 flex justify-between items-center">
          <span className="font-semibold">Total Amount</span>
          <span className="text-2xl font-bold text-[#e13e00]">
            ₱{(totalPrice).toFixed(2)}
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
          disabled={isProcessing || (paymentInfo.method !== "cod" && !meetsMinimum)}
          className="flex-1 bg-[#e13e00] hover:bg-[#c13500] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
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