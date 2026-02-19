"use client";

import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import OrderSummaryStep from "./OrderSummaryStep";
import PayToLink from "./PayToLink";

type CheckoutStep = "summary" | "payment" | "success";

const CheckoutPage: React.FC = () => {
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("summary");

  const handleNext = (from: CheckoutStep) => {
    switch (from) {
      case "summary":
        setCurrentStep("payment");
        break;
      case "success":
        setCurrentStep("success");
        break;
    }

    window.scrollTo(0, 0);
  };

  const handleBack = (from: CheckoutStep) => {
    switch (from) {
      case "summary":
        router.push("/");
        break;
      case "payment":
        localStorage.removeItem("active_payment");
        setCheckoutUrl("");
        setCurrentStep("summary");
        break;
      case "success":
        router.push("/");
        break;
    }
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/** Header */}
      <header className="darkBackground sticky top-0 z-40">
        <div className="max-w-2xl mx-auto py-4 flex items-center gap-4">
          <button
            onClick={() => handleBack(currentStep)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">Checkout</h1>
            <p className="text-gray-400 text-sm">
              {currentStep === "summary" && "Review your order"}
              {/* {currentStep === "delivery" && "Delivery options"} */}
              {currentStep === "payment" && "Payment method"}
            </p>
          </div>
        </div>
      </header>

      {/** Step Content */}
      <div className="max-w-xl mx-auto px-4 py-6">
        {currentStep === "summary" && <OrderSummaryStep />}

        {currentStep === "payment" && (
          <PayToLink
            checkoutUrl={checkoutUrl}
            setCurrentStep={setCurrentStep}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
