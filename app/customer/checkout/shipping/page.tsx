'use client'

import React from "react";
import ShippingAddress from "./ShippingAddress";
import { useCheckout } from "@/contexts/CheckoutContext";

const page = () => {
  const { orderDetails, shippingErrors, openModal, handleStateChange } =
    useCheckout();
    
  return (
    <ShippingAddress
      shippingAddress={orderDetails.shippingAddress}
      errors={shippingErrors}
      openModal={openModal}
      onChange={handleStateChange}
    />
  );
};

export default page;
