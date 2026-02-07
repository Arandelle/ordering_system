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
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import OrderSummaryStep from "./OrderSummaryStep";
import DeliveryStep, { DeliveryInfo } from "./DeliveryStep";
import PaymentStep, { PaymentInfo } from "./PaymentStep";
import ConfirmationStep from "./ConfirmationStep";
import PayToLink from "./PayToLink";

type CheckoutStep =
  | "summary"
  | "delivery"
  | "payment"
  | "confirmation"
  | "success";

const CheckoutPage: React.FC = () => {
   const [checkoutUrl, setCheckoutUrl] = useState("");
  const router = useRouter();
  const { totalPrice } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("summary");
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    type: "delivery",
    fullname: "",
    phone: "",
    address: "",
    city: "",
    barangay: "",
    landmark: "",
    instructions: "",
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: "cod",
  });


  const steps = [
    { id: "summary", label: "Order", icon: ShoppingBag },
    // { id: "delivery", label: "Delivery", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "confirmation", label: "Confirm", icon: CheckCircle },
  ];

  const getStepIndex = (step: CheckoutStep) => {
    const index = steps.findIndex((s) => s.id === step);
    return index === -1 ? steps.length : index;
  };

  const isValidExpiry = (expiry: string): string | null => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return "Invalid format (MM/YY)";
    }

    const [month, year] = expiry.split("/").map(Number);
    if (month < 1 || month > 12) {
      return "Invalid month or year";
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return "Card has expired!";
    }

    return null;
  };

  const validatePayment = (): boolean => {
    const errors: Record<string, string> = {};
    if (paymentInfo.method === "gcash") {
      if (!paymentInfo.gcashNumber?.trim()) {
        errors.gcashNumber = "Gcash number is required!";
      } else if (
        !/^(\+63|0|63)?[0-9]{10,11}$/.test(
          paymentInfo.gcashNumber.replace(/\s/g, ""),
        )
      ) {
        errors.gcashNumber = "Please enter a valid GCash number.";
      }
    }

    if (paymentInfo.method === "card") {
      if (!paymentInfo.cardName?.trim()) {
        errors.cardName = "Cardholder name is required!";
      }
      if (!paymentInfo.cardNumber?.trim()) {
        errors.cardNumber = "Card Number is required!";
      } else if (paymentInfo.cardNumber.replace(/\s/g, "").length < 16) {
        errors.cardNumber = "Please enter a valid number";
      }
      if (!paymentInfo.cardExpiry?.trim()) {
        errors.cardExpiry = "Expiry date is required";
      } else {
        const expiryError = isValidExpiry(paymentInfo.cardExpiry);
        if (expiryError) {
          errors.cardExpiry = expiryError;
        }
      }
      if (!paymentInfo.cardCvv?.trim()) {
        errors.cardCvv = "CVV is required";
      } else if (paymentInfo.cardCvv.length < 3) {
        errors.cardCvv = "Invalid CVV";
      }
    }

    return Object.keys(errors).length === 0;
  };

  const handleNext = (from: CheckoutStep) => {
    switch (from) {
      case "summary":
        // setCurrentStep("delivery");
         setCurrentStep("payment");
        break;
      // case "delivery":
      //   if (validateDelivery()) {
      //     setCurrentStep("payment");
      //   }
      //   break;
      case "payment":
        if (validatePayment()) {
          setCurrentStep("confirmation");
        }
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
      // case "delivery":
      //   setCurrentStep("summary");
      //   break;
      case "payment":
        // setCurrentStep("delivery");
        setCurrentStep("summary");
        break;
      case "confirmation":
        setCurrentStep("payment");
        break;
      case "success":
        router.push('/');
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
        {/* {currentStep === "delivery" && (
          <DeliveryStep
            deliveryInfo={deliveryInfo}
            setDeliveryInfo={setDeliveryInfo}
            errors={deliveryErrors}
            onNext={() => handleNext("delivery")}
            onBack={() => handleBack("delivery")}
          />
        )} */}
{/* 
        {currentStep === "payment" && (
          <PaymentStep
            paymentInfo={paymentInfo}
            setPaymentInfo={setPaymentInfo}
            errors={paymentErrors}
            onNext={() => handleNext("payment")}
            onBack={() => handleBack("payment")}
            totalAmount={totalAmount}
          />
        )} */}

        {currentStep === "payment" && (
          <PayToLink checkoutUrl = {checkoutUrl}/>
        )}

        {(currentStep === "confirmation" || currentStep === "success") && (
          <ConfirmationStep
            deliveryInfo={deliveryInfo}
            paymentInfo={paymentInfo}
            onNext={() => handleNext("success")}
            onBack={() => handleBack('confirmation')}
            onEditDelivery={() => setCurrentStep('delivery')}
            onEditPayment={() => setCurrentStep('payment')}
            currentStep={currentStep}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
