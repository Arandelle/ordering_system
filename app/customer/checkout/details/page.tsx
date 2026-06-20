"use client";

import React from "react";
import CustomerDetails from "./CustomerDetails";
import { useCheckoutContext } from "@/contexts/CheckoutContext";

const page = () => {
  const {
    orderDetails,
    customerErrors,
    canSyncProfileDetails,
    syncCheckoutDetailsFromProfile,
    handleStateChange,
    validateField,
  } = useCheckoutContext();

  return (
    <CustomerDetails
      customerData={orderDetails.customer}
      errors={customerErrors}
      canSyncProfileDetails={canSyncProfileDetails}
      onSyncProfileDetails={syncCheckoutDetailsFromProfile}
      onChange={handleStateChange}
      onBlur={(field, value) => validateField("customer", field, value)}
    />
  );
};

export default page;
