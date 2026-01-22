"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle,
  CreditCard,
  ShoppingBag,
  Truck,
} from "lucide-react";
import React, { useState } from "react";
import OrderSummaryStep from "./OrderSummaryStep";

type CheckoutStep =
  | "summary"
  | "delivery"
  | "payment"
  | "confirmation"
  | "success";

const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("summary");

  const steps = [
    { id: "summary", label: "Order", icon: ShoppingBag },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "confirmation", label: "Confirm", icon: CheckCircle },
  ];

  const getStepIndex = (step: CheckoutStep) => {
    const index = steps.findIndex((s) => s.id === step);
    return index === -1 ? steps.length : index;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/** Header */}
      <header className="darkBackground sticky top-0 z-50">
        <div className="max-w-lg mx-auto p-4 flex items-center gap-4">
          <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">Checkout</h1>
            <p className="text-gray-400 text-sm">
              {currentStep === "summary" && "Review your order"}
              {currentStep === "delivery" && "Delivery options"}
              {currentStep === "payment" && "Payment method"}
              {currentStep === "confirmation" && "Confirm order"}
            </p>
          </div>
        </div>
      </header>

      {/** Progress steps */}
      <div className="bg-white border-b border-gray-100 sticky top-[72px] z-40">
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-[#e13e00] text-white" : "bg-gray-100 text-gray-400"}`}
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
            {currentStep === 'summary' && (
              <OrderSummaryStep />
            )}
             {currentStep === 'delivery' && (
              <div>
                This page is delivery
              </div>
            )}
      </div>
    </div>
  );
};

export default CheckoutPage;
