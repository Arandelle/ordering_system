"use client";

import { usePathname } from "next/navigation";
import { CheckoutHeader } from "./CheckoutHeader";
import { syne } from "@/app/font";
import CartList from "./CartList";
import BranchSelector from "./BranchSelector";
import { CheckoutStep, useCheckout } from "@/contexts/CheckoutContext";

const CheckoutShell = ({ children }: { children: React.ReactNode }) => {
  const { selectedBranch, openModal, orderDetails, handleNext } = useCheckout();

  const pathname = usePathname();
  const details = pathname === CheckoutStep.DETAILS;

  return (
    <div className={`${syne.className} min-h-screen bg-slate-50`}>
      <CheckoutHeader step={pathname} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            {/* Shared header */}
            <div className="pb-6">
              <h2 className="text-base font-semibold text-slate-900">
                {details ? "Your details" : "Shipping address"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {details
                  ? "We'll use this to process and contact you about your order."
                  : "Where should we deliver your order?"}
              </p>
            </div>

            <BranchSelector
              selectedBranch={selectedBranch}
              openModal={openModal}
            />

            {children}
          </div>

          <CartList
            selectedBranch={selectedBranch}
            orderDetails={orderDetails}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutShell;
