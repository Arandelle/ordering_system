"use client";

import { useState } from "react";
import SectionHeader from "@/app/admin/components/SectionHeader";
import ArchivedAccountsTab from "./components/ArchivedAccountsTab";
import ArchivedOrdersTab from "./components/ArchivedOrdersTab";

const TABS = [
  { key: "accounts", label: "Accounts" },
  { key: "orders", label: "Orders" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const ArchivedPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("accounts");

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Archived Records"
        subTitle="Soft-deleted items preserved for historical records"
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-stone-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-brand-color-500"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-color-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "accounts" && <ArchivedAccountsTab />}
      {activeTab === "orders" && <ArchivedOrdersTab />}
    </section>
  );
};

export default ArchivedPage;
