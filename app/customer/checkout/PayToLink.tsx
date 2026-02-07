import { useCart } from "@/contexts/CartContext";
import { CreditCard, ExternalLink } from "lucide-react";
import React, { useEffect } from "react";

const PayToLink = ({ checkoutUrl, setCurrentStep }: { checkoutUrl: string, setCurrentStep: (step: "summary" | "payment") => void}) => {

  const { totalPrice } = useCart();
  const taxAmount = totalPrice * 0.12;

  const { clearCart } = useCart();

  useEffect(() => {
    const saved = localStorage.getItem("active_payment");
    if (!saved) return;

    const { linkId } = JSON.parse(saved);

    const interval = setInterval(async () => {
      const res = await fetch(
        `/api/paymongo/link-status?linkId=${linkId}`
      );
      const data = await res.json();

      if (data.status === "paid") {
        clearCart();
        localStorage.removeItem("active_payment");
        clearInterval(interval);
        setCurrentStep("summary");
      }

      if (data.status === "expired") {
        localStorage.removeItem("active_payment");
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [clearCart, setCurrentStep]);


  const totalAmount = totalPrice + taxAmount

  return (
  <div className="space-y-5">
  {/* Order Summary */}
  <div className="bg-[#1a1a1a] rounded-2xl p-5 text-white shadow-lg">
    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

    <div className="space-y-3 text-sm">
      <div className="flex justify-between text-gray-300">
        <span>Subtotal</span>
        <span>₱{totalPrice.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-gray-300">
        <span>Tax (12%)</span>
        <span>₱{taxAmount.toFixed(2)}</span>
      </div>
    </div>

    <div className="border-t border-white/20 mt-4 pt-4 flex justify-between items-center">
      <span className="text-base font-medium">Total Amount</span>
      <span className="text-3xl font-bold text-[#e13e00]">
        ₱{totalAmount.toFixed(2)}
      </span>
    </div>
  </div>

  {/* Payment Card */}
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-full bg-[#e13e00]/10">
        <CreditCard size={22} className="text-[#e13e00]" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        Secure Checkout
      </h3>
    </div>

    <p className="text-sm text-gray-600 mb-5">
      You’ll be redirected to a secure payment page to complete your order.
    </p>

    <a
      href={checkoutUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex w-full items-center justify-center gap-3 bg-[#e13e00] hover:bg-[#c13500] text-white py-4 rounded-xl font-bold text-lg transition-all"
    >
      <span>Pay ₱{totalAmount.toFixed(2)}</span>
      <ExternalLink
        size={20}
        className="transition-transform group-hover:translate-x-1"
      />
    </a>

    <div className="mt-4 space-y-2 text-xs text-gray-500">
      <p className="flex items-center gap-2">
        🔒 Encrypted & secure payment
      </p>
      <p className="flex items-center gap-2">
        ⚡ Instant confirmation after payment
      </p>
      <p className="flex items-center gap-2">
        💳 Powered by PayMongo
      </p>
    </div>
  </div>
</div>

  );
};

export default PayToLink;
