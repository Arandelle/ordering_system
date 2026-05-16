"use client";

import React from "react";
import CustomerDetails from "./CustomerDetails";
import { useCheckout } from "@/contexts/CheckoutContext";

const page = () => {
  const { orderDetails, customerErrors, handleStateChange, validateField } =
    useCheckout();
  return (
    <CustomerDetails
      customerData={orderDetails.customer}
      errors={customerErrors}
      onChange={handleStateChange}
      onBlur={(field, value) => validateField("customer", field, value)}
    />
  );
};

export default page;
