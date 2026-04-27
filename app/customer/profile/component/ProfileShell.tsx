"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DynamicIcon } from "@/lib/DynamicIcon";

export function ProfileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const TABS = [
    { href: "personal", label: "Personal Info", icon: "User" },
    { href: "address", label: "Address", icon: "MapPin" },
    { href: "security", label: "Security", icon: "Lock" },
  ];

  return (
    <>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <DynamicIcon name="ArrowLeft" size={18} />
          </Link>
          <div>
            <h1 className={`text-xl font-bold text-gray-900`}>My Profile</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab Bar */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm mb-6">
          {TABS.map((tab) => {
            const activeTab = pathname === `/profile/${tab.href}`;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab
                    ? "bg-brand-color-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <DynamicIcon name={tab.icon as any} size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </>
  );
}
