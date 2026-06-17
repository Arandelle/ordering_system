'use client'

import React from "react";
import ShippingAddress from "./ShippingAddress";
import { useCheckout } from "@/contexts/CheckoutContext";

const page = () => {
  const {
    orderDetails,
    shippingErrors,
    openModal,
    handleStateChange,
    handleShippingCoordinatesChange,
    validateField,
  } = useCheckout();

  const handleShippingBlur = (field: string, value: string) => {
    validateField("shippingAddress", field, value);
  };

  const handleCoordinatesChange = (
    coordinates: typeof orderDetails.shippingAddress.coordinates,
  ) => {
    handleShippingCoordinatesChange(coordinates);
    validateField("shippingAddress", "coordinates", coordinates);
  };
    
  return (
    <ShippingAddress
      shippingAddress={orderDetails.shippingAddress}
      errors={shippingErrors}
      openModal={openModal}
      onChange={handleStateChange}
      onBlur={handleShippingBlur}
      onCoordinatesChange={handleCoordinatesChange}
    />
  );
};

export default page;
