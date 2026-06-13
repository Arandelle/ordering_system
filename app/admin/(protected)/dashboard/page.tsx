"use client";

import DashboardCards from "@/app/admin/components/DashboardCard";
import SalesChart from "@/app/admin/components/SalesChart";
import { useAdminBranchContext } from "@/contexts/AdminBranchContext";

export default function DashboardPage() {

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard Overview
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
