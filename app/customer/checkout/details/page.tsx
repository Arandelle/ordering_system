"use client";

import React from "react";
import CustomerDetails from "./CustomerDetails";
import { useCheckoutContext } from "@/contexts/CheckoutContext";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";
import { DetailsFormSkeleton } from "../CheckoutFormSkeleton";

const page = () => {
  const {
    session,
    orderDetails,
    customerErrors,
    shouldShowSyncProfileDetails,
    syncCheckoutDetailsFromProfile,
    handleStateChange,
    validateField,
    isReady,
  } = useCheckoutContext();

  if (!isReady) {
    return <DetailsFormSkeleton />;
  }

  return (
    <CustomerDetails
      customerData={orderDetails.customer}
      errors={customerErrors}
      isAuthenticated={Boolean(session?.user)}
      isDelivery={orderDetails.fulfillmentType === FULFILLMENT_TYPE.DELIVERY}
      shouldShowSyncProfileDetails={shouldShowSyncProfileDetails}
      onSyncProfileDetails={syncCheckoutDetailsFromProfile}
      onChange={handleStateChange}
      onBlur={(field, value) => validateField("customer", field, value)}
    />
  );
};

export default page;
