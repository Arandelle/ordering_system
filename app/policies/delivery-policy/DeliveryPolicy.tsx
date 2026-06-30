"use client";

import PolicyPageLayout from "@/app/policies/components/PolicyPageLayout";
import DeliveryPolicyContent from "@/app/policies/components/DeliveryPolicyContent";
import React from "react";

const DeliveryPolicy = () => {
  return (
    <PolicyPageLayout activeTab="/delivery-policy">
      <DeliveryPolicyContent />
    </PolicyPageLayout>
  );
};

export default DeliveryPolicy;
