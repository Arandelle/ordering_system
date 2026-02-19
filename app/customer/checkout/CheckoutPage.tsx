"use client";

import {
  ArrowLeft,
  Check,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OrderSummaryStep from "./OrderSummaryStep";
import PayToLink from "./PayToLink";

type CheckoutStep = "summary" | "payment" | "success";

const CheckoutPage: React.FC = () => {
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("summary");

  const steps = [
    { id: "summary", label: "Order", icon: ShoppingBag },
    { id: "payment", label: "Payment", icon: CreditCard },
  ];

  const getStepIndex = (step: CheckoutStep) => {
    const index = steps.findIndex((s) => s.id === step);
    return index === -1 ? steps.length : index;
  };

  useEffect(() => {
    const savedPayment = localStorage.getItem("active_payment");

    if (!savedPayment) {
      // No active payment → stay on order summary
      setCurrentStep("summary");
      return;
    }

    try {
      const parsed = JSON.parse(savedPayment);

      // Optional: expire abandoned links after 30 minutes
      const MAX_AGE = 30 * 60 * 1000;
      if (Date.now() - parsed.createdAt > MAX_AGE) {
        localStorage.removeItem("active_payment");
        setCurrentStep("summary");
        return;
      }

      // Active payment exists → resume payment step
      setCheckoutUrl(parsed.checkoutUrl);
      setCurrentStep("payment");
    } catch {
      // Corrupted data → reset safely
      localStorage.removeItem("active_payment");
      setCurrentStep("summary");
    }
  }, [currentStep]);

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
        <div className="max-w-lg mx-auto p-4 flex items-center gap-4">
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

      {/** Progress steps */}
      <div className="bg-white border-b border-gray-100 sticky top-18 z-40">
        <div className="max-w-lg mx-auto p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = getStepIndex(currentStep) > index;

              return (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-[#e13e00] text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    >
                      {isCompleted ? (
                        <Check size={20} />
                      ) : (
                        <StepIcon size={20} />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 font-medium text-[#e13e00] ${isActive ? "text-[#e13e00]" : isCompleted ? "text-green-500" : "text-gray-400"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${getStepIndex(currentStep) > index ? "bg-green-500" : "bg-gray-200"}`}
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/** Step Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {currentStep === "summary" && (
          <OrderSummaryStep
            onNext={() => handleNext("summary")}
            onBack={() => handleBack("summary")}
            onSetCheckoutUrl={setCheckoutUrl}
          />
        )}

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
