"use client";

import DashboardCards from "@/app/admin/components/DashboardCard";
import SalesChart from "@/app/admin/components/SalesChart";
import { useAdminBranchContext } from "@/contexts/AdminBranchContext";
import { useStaffContext } from "@/contexts/StaffContext";
import { STAFF_ROLES } from "@/types/staff";

export default function DashboardPage() {
  const { selectedBranch, isLoadingBranches } = useAdminBranchContext();
  const staffData = useStaffContext();
  const isSuperAdmin = staffData?.role === STAFF_ROLES.SUPERADMIN;

  const dashboardBranchName = isLoadingBranches
    ? "Loading..."
    : isSuperAdmin
      ? (selectedBranch?.name ?? "All Branches")
      : (staffData?.branch?.name ?? "Assigned Branch");

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
