"use client";

import { useState, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { CheckoutHeader } from "./CheckoutHeader";
import { syne } from "@/app/font";
import CartList, { CartListHandle } from "./CartList";
import BranchSelector from "./BranchSelector";
import { CheckoutStep, useCheckout } from "@/contexts/CheckoutContext";
import { FulfillmentSelector } from "./FulfillmentSelector";
import { useSettings } from "@/hooks/api/useSettings";
import { resolveCodAvailability } from "@/lib/codAvailability";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";
import ProductRecommendations from "../components/ProductRecommendations";
import { useCart } from "@/contexts/CartContext";
import OrderConfirmationModal from "./components/OrderConfirmationModal";

const CheckoutShell = ({ children }: { children: React.ReactNode }) => {
  const { cartItems } = useCart();

  const {
    selectedBranch,
    orderDetails,
    handleFulfillmentTypeChange,
    handleNext,
  } = useCheckout();

  const pathname = usePathname();
  const details = pathname === CheckoutStep.DETAILS;
  const isPickup = orderDetails.fulfillmentType === FULFILLMENT_TYPE.PICKUP;
  const isDineIn = orderDetails.fulfillmentType === FULFILLMENT_TYPE.DINE_IN;

  // ── COD availability (tri-state resolution) ──
  const { data: settings } = useSettings();
  const isCodAvailable = useMemo(
    () =>
      resolveCodAvailability(
        selectedBranch?.codEnabled,
        settings?.codEnabled ?? false,
      ),
    [selectedBranch?.codEnabled, settings?.codEnabled],
  );

  // ── Lifted state (shared between CartList and the confirmation modal) ──
  const cartListRef = useRef<CartListHandle>(null);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"maya" | "cod">("maya");

  // CartList calls this after validation passes — opens the modal at shell level
  const handleConfirmOrder = () => setShowOrderConfirmation(true);

  // User confirmed in the modal — place the order with the selected payment method
  const handlePlaceOrderFromModal = () => {
    setShowOrderConfirmation(false);
    cartListRef.current?.placeOrder();
  };

  return (
    <div className={`${syne.className} h-screen bg-slate-50 overflow-y-auto hide-scrollbar`}>
      <div className="sticky top-0 z-20">
        <CheckoutHeader step={pathname} />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        <div className=" grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            {/* Shared header */}
            <div className="pb-6">
              <h2 className="text-base font-semibold text-slate-900">
                {details
                  ? "Your details"
                  : isDineIn
                    ? "Reservation details"
                    : isPickup
                      ? "Pickup details"
                      : "Shipping address"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {details
                  ? "We'll use this to process and contact you about your order."
                  : isDineIn
                    ? "Confirm your reservation at the selected branch."
                    : isPickup
                      ? "Review where you will collect your order."
                      : "Where should we deliver your order?"}
              </p>
            </div>

            <BranchSelector selectedBranch={selectedBranch} />

            <FulfillmentSelector
              value={orderDetails.fulfillmentType}
              onChange={handleFulfillmentTypeChange}
            />

            {children}
          </div>

          <div className="sticky top-20 z-10">
            <CartList
              ref={cartListRef}
              selectedBranch={selectedBranch}
              orderDetails={orderDetails}
              onNext={handleNext}
              onConfirmOrder={handleConfirmOrder}
              selectedPayment={selectedPayment}
              setSelectedPayment={setSelectedPayment}
              isCodAvailable={isCodAvailable}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg">
          <ProductRecommendations
            branchId={selectedBranch?._id ?? null}
            excludeIds={cartItems.map((item) => item._id)}
            title="You may also like"
            layout="grid"
          />
        </div>
      </div>

      {/* Confirmation modal rendered at shell level so it sits above the sticky header in the DOM */}
      <OrderConfirmationModal
        isOpen={showOrderConfirmation}
        onClose={() => setShowOrderConfirmation(false)}
        onConfirm={handlePlaceOrderFromModal}
        selectedBranch={selectedBranch}
        orderDetails={orderDetails}
        cartItems={cartItems}
        displayTotalPrice={cartListRef.current?.getDisplayTotal() ?? 0}
        isPlacingOrder={false}
      />
    </div>
  );
};

export default CheckoutShell;
