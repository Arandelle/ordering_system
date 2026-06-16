"use client";

import DashboardCards from "@/app/admin/components/DashboardCard";
import SalesChart from "@/app/admin/components/SalesChart";
import { useBranchName } from "../../hooks/useBranchName";

export default function DashboardPage() {
  const { dashboardBranchName } = useBranchName();

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          Dashboard Overview -{" "}
          <span className="text-brand-color-500">{dashboardBranchName}</span>
        </h1>

        <p className="text-gray-500">
          Monitor your restaurant performance and operations
        </p>
      </div>

      <DashboardCards />

      {/* Charts */}
      <SalesChart />
    </div>
  );
}
