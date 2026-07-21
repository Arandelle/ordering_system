"use client";

import React, { useEffect } from "react";
import ShippingAddress from "./ShippingAddress";
import { useCheckoutContext } from "@/contexts/CheckoutContext";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";
import { ShippingFormSkeleton } from "../CheckoutFormSkeleton";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const {
    session,
    orderDetails,
    shippingErrors,
    shouldShowSyncProfileDetails,
    syncCheckoutDetailsFromProfile,
    openModal,
    handleStateChange,
    handleShippingCoordinatesChange,
    validateField,
    isReady,
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

  // Pickup and dine-in don't need a shipping address — redirect if user
  // manually navigates here (e.g. typing the URL directly)
  const needsRedirect =
    orderDetails.fulfillmentType === FULFILLMENT_TYPE.PICKUP ||
    orderDetails.fulfillmentType === FULFILLMENT_TYPE.DINE_IN;

  useEffect(() => {
    if (isReady && needsRedirect) {
      router.replace("/checkout/details");
    }
  }, [isReady, needsRedirect, router]);

  if (!isReady) {
    return <ShippingFormSkeleton />;
  }

  // Render nothing while redirecting — prevents flash of shipping form
  if (needsRedirect) {
    return null;
  }

  return (
    <ShippingAddress
      shippingAddress={orderDetails.shippingAddress}
      errors={shippingErrors}
      isAuthenticated={Boolean(session?.user)}
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
