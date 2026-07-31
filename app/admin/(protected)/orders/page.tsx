"use client";

import OrdersTable from "@/app/admin/(protected)/orders/components/OrdersTable";
import React, { useState } from "react";
import Pagination from "@/components/ui/Pagination";
import { useAdminOrders } from "@/hooks/api/admin/useAdminOrders";
import { ORDER_STATUSES, OrderStatus } from "@/types/orderConstants";
import { useAdminBranchContext } from "@/contexts/AdminBranchContext";
import { useBranchName } from "../../hooks/useBranchName";
import SectionHeader from "../../components/SectionHeader";

/**
 * Filter keys that map to API filter params.
 * "all" and "unpaid" are virtual filters — they use paymentFilter instead of status.
 * "cancelled_group" uses multiple status values via $in.
 */
type statusFilterType =
  | "all"
  | "pending_payment"
  | "unpaid"
  | OrderStatus
  | "cancelled_group";

const ORDER_FILTER_OPTIONS: {
  key: statusFilterType;
  label: string;
  statuses?: OrderStatus | OrderStatus[];
  paymentFilter?: "confirmed" | "unpaid";
}[] = [
  { key: "all", label: "All Valid Orders", paymentFilter: "confirmed" },
  {
    key: "pending_payment",
    label: "Pending Payment",
    statuses: ORDER_STATUSES.PENDING_PAYMENT,
  },
  { key: "unpaid", label: "Unpaid", paymentFilter: "unpaid" },
  {
    key: ORDER_STATUSES.PENDING,
    label: "Pending",
    statuses: ORDER_STATUSES.PENDING,
  },
  {
    key: ORDER_STATUSES.CONFIRMED,
    label: "Confirmed",
    statuses: ORDER_STATUSES.CONFIRMED,
  },
  {
    key: ORDER_STATUSES.PREPARING,
    label: "Preparing",
    statuses: ORDER_STATUSES.PREPARING,
  },
  {
    key: ORDER_STATUSES.DISPATCH,
    label: "Dispatch",
    statuses: ORDER_STATUSES.DISPATCH,
  },
  {
    key: ORDER_STATUSES.READY_FOR_PICKUP,
    label: "Ready for Pickup",
    statuses: ORDER_STATUSES.READY_FOR_PICKUP,
  },
  {
    key: ORDER_STATUSES.COMPLETED,
    label: "Completed",
    statuses: ORDER_STATUSES.COMPLETED,
  },
  {
    key: "cancelled_group",
    label: "Cancelled / Failed / Expired",
    statuses: [
      ORDER_STATUSES.CANCELLED,
      ORDER_STATUSES.FAILED,
      ORDER_STATUSES.EXPIRED,
    ],
  },
];

const OrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<statusFilterType>("all");
  const [fulfillmentTypeFilter, setFulfillmentTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { selectedBranchId } = useAdminBranchContext();
  const { branchName } = useBranchName();

  // Resolve the selected filter option into API query params
  const selectedFilter = ORDER_FILTER_OPTIONS.find(
    (option) => option.key === statusFilter,
  )!;

  const { data, isPending } = useAdminOrders({
    page: currentPage,
    limit,
    search: appliedSearch,
    status: selectedFilter.statuses,
    paymentFilter: selectedFilter.paymentFilter,
    fulfillmentType:
      fulfillmentTypeFilter === "all" ? undefined : fulfillmentTypeFilter,
    sort: sortOption === "default" ? undefined : sortOption,
    branchId: selectedBranchId === "all" ? undefined : selectedBranchId,
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;
  const filterCounts = data?.tabCounts;

  const handleSearch = () => {
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: statusFilterType) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleFulfillmentTypeChange = (value: string) => {
    setFulfillmentTypeFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setAppliedSearch("");
    setStatusFilter("all");
    setFulfillmentTypeFilter("all");
    setSortOption("default");
    setCurrentPage(1);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedBranchId]);

  return (
    <section className="space-y-6">
      <SectionHeader
        title={
          <>
            Orders Management —{" "}
            <span className="text-brand-color-500">{branchName}</span>
          </>
        }
        subTitle="View and manage all customers' orders"
      />
      <OrdersTable
        orders={orders}
        isPending={isPending}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) =>
          handleFilterChange(val as statusFilterType)
        }
        filterOptions={ORDER_FILTER_OPTIONS}
        filterCounts={filterCounts}
        fulfillmentTypeFilter={fulfillmentTypeFilter}
        onFulfillmentTypeFilterChange={handleFulfillmentTypeChange}
        sortOption={sortOption}
        onSortOptionChange={handleSortChange}
        onResetFilters={handleResetFilters}
      />

      {pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setCurrentPage(1);
          }}
        />
      )}
    </section>
  );
};

export default OrdersPage;
