'use client'

import React from "react";
import ShippingAddress from "./ShippingAddress";
import { useCheckoutContext } from "@/contexts/CheckoutContext";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";

const page = () => {
  const {
    orderDetails,
    shippingErrors,
    shouldShowSyncProfileDetails,
    syncCheckoutDetailsFromProfile,
    openModal,
    handleStateChange,
    handleShippingCoordinatesChange,
    validateField,
  } = useCheckoutContext();

  const handleShippingBlur = (field: string, value: string) => {
    validateField("shippingAddress", field, value);
  };

  const handleCoordinatesChange = (
    coordinates: typeof orderDetails.shippingAddress.coordinates,
  ) => {
    handleShippingCoordinatesChange(coordinates);
    validateField("shippingAddress", "coordinates", coordinates);
  };

  if (orderDetails.fulfillmentType === FULFILLMENT_TYPE.PICKUP) {
    return (
      <div className="space-y-4 py-6">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">
            Pickup selected
          </p>
          <p className="mt-1 text-sm leading-6 text-green-700">
            No shipping address is required. We will use your personal details
            to contact you when the order is ready for pickup.
          </p>
        </div>
      </div>
    );
  }
    
  return (
    <ShippingAddress
      shippingAddress={orderDetails.shippingAddress}
      errors={shippingErrors}
      shouldShowSyncProfileDetails={shouldShowSyncProfileDetails}
      onSyncProfileDetails={syncCheckoutDetailsFromProfile}
      openModal={openModal}
      onChange={handleStateChange}
      onBlur={handleShippingBlur}
      onCoordinatesChange={handleCoordinatesChange}
    />
  );
};

export default page;
