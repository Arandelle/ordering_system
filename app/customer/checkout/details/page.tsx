'use client'

import React from "react";
import CustomerDetails from "./CustomerDetails";
import { useCheckout } from "@/contexts/CheckoutContext";

const page = () => {
  const { orderDetails, customerErrors, handleStateChange } = useCheckout();
  return (
    <CustomerDetails
      customerData={orderDetails.customer}
      errors={customerErrors}
      onChange={handleStateChange}
    />
  );
};

export default page;
