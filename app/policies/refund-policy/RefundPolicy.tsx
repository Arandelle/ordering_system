"use client";

import PolicyPageLayout from "@/app/policies/components/PolicyPageLayout";
import RefundPolicyContent from "@/app/policies/components/RefundPolicyContent";
import React from "react";

const RefundPolicy = () => {
  return (
    <PolicyPageLayout activeTab="/refund-policy">
      <RefundPolicyContent />
    </PolicyPageLayout>
  );
};

export default RefundPolicy;
