"use client";

import NewHeader from "@/app/main/components/newdesign/NewHeader";
import Footer from "@/components/ui/Footer";
import React from "react";

/** Navigation tabs linking to each legal/policy page */

const PARENT_PAGE = "/policies";

const POLICY_NAV_ITEMS = [
  { name: "Privacy Policy", href: `${PARENT_PAGE}/privacy-policy` },
  { name: "Terms of Use", href: `${PARENT_PAGE}/terms-of-use` },
  { name: "Refund Policy", href: `${PARENT_PAGE}/refund-policy` },
  { name: "Delivery Policy", href: `${PARENT_PAGE}/delivery-policy` },
];

/**
 * Shared layout wrapper for all policy/legal pages.
 * Provides header, footer, and a horizontal nav tabs so users
 * can switch between the four legal documents.
 */
const PolicyPageLayout = ({
  activeTab,
  children,
}: {
  activeTab: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <NewHeader />
      <main className="min-h-screen bg-white">
        {/* Nav tabs */}
        <nav className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
            {POLICY_NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === item.href
                    ? "text-brand-color-500 border-b-2 border-brand-color-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {item.name}
              </a>
            ))}
          </div>
        </nav>

        {/* Content area */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          {children}
        </div>
      </main>
      <Footer variant="marketing" />
    </>
  );
};

export default PolicyPageLayout;
