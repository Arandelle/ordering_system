"use client";

import React from "react";
import CustomerDetails from "./CustomerDetails";
import { useCheckoutContext } from "@/contexts/CheckoutContext";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";

const page = () => {
  const {
    session,
    orderDetails,
    customerErrors,
    shouldShowSyncProfileDetails,
    syncCheckoutDetailsFromProfile,
    handleStateChange,
    validateField,
  } = useCheckoutContext();

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
