"use client";

import PolicyPageLayout from "@/app/policies/components/PolicyPageLayout";
import PrivacyPolicyContent from "@/app/policies/components/PrivacyPolicyContent";
import React from "react";

const PrivacyPolicy = () => {
  return (
    <PolicyPageLayout activeTab="/privacy-policy">
      <PrivacyPolicyContent />
    </PolicyPageLayout>
  );
};

export default PrivacyPolicy;
