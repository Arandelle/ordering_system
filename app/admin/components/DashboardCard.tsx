"use client";

import { useAdminBranchContext } from "@/contexts/AdminBranchContext";
import { getBranchQuery } from "@/helper/getBranchQuery";
import { getErrorMessage } from "@/helper/getErrorMessage";
import { apiClient } from "@/lib/apiClient";
import type { DashboardStats } from "@/types/adminType";
import { getLucideIcon } from "@/utils/iconUtils";
import { useQuery } from "@tanstack/react-query";

const DashboardCard = () => {
  const { selectedBranchId } = useAdminBranchContext();

  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard-stats", selectedBranchId],
    queryFn: () =>
      apiClient.get<DashboardStats>(
        `/dashboard-stats${getBranchQuery(selectedBranchId)}`,
      ),
  });

  const dashboardStats = dashboardQuery?.data;
  const errorMessage = dashboardQuery.isError
    ? getErrorMessage(dashboardQuery.error)
    : null;

  if (dashboardQuery.isLoading) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-500">
        Loading dashboard stats...
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (!dashboardStats) return null;

  const cards = [
    {
      title: "Total Orders",
      value: dashboardStats.totalOrders,
      icon: "Package",
      color: "bg-blue-600",
      change: "",
    },
    {
      title: "Total Revenue",
      value: `PHP ${dashboardStats.totalRevenue.toLocaleString()}`,
      icon: "CircleDollarSign",
      color: "bg-emerald-600",
      change: "",
    },
    {
      title: "Pending Orders",
      value: dashboardStats.pendingOrders,
      icon: "ClockAlert",
      color: "bg-[#ef4501]",
      change: "",
    },
    {
      title: "Best Seller",
      value: dashboardStats.bestSellingProduct,
      icon: "Trophy",
      color: "bg-amber-600",
      change: `${dashboardStats.bestSellingCount} sold`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = getLucideIcon(card.icon);

        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded ${card.color} text-white flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon />
              </div>
              {card.change && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {card.change}
                </span>
              )}
            </div>

            <h3 className="text-stone-500 text-sm font-medium mb-2">
              {card.title}
            </h3>
            <p className="text-3xl font-semibold text-stone-800">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCard;
