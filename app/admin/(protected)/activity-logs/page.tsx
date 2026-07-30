"use client";

import React, { useState } from "react";
import Pagination from "@/components/ui/Pagination";
import { useAdminBranchContext } from "@/contexts/AdminBranchContext";
import { useBranchName } from "../../hooks/useBranchName";
import {
  useAdminActivityLogs,
  ActivityLogParams,
} from "@/hooks/api/useActivityLogs";
import ActivityLogsTable from "./components/ActivityLogsTable";
import { SelectField } from "@/components/ui/FormComponents";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "order", label: "Orders" },
  { value: "payment", label: "Payments" },
  { value: "inventory", label: "Inventory" },
  { value: "voucher", label: "Vouchers" },
];

const ACTOR_OPTIONS = [
  { value: "all", label: "All Actors" },
  { value: "staff", label: "Staff" },
  { value: "customer", label: "Customers" },
  { value: "system", label: "System" },
  { value: "webhook", label: "Webhooks" },
];

const ActivityLogsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");

  const { selectedBranchId } = useAdminBranchContext();
  const { branchName } = useBranchName();

  const params: ActivityLogParams = {
    page: currentPage,
    limit,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    actorType: actorFilter === "all" ? undefined : (actorFilter as any),
    branchId: selectedBranchId === "all" ? undefined : selectedBranchId,
  };

  const { data, isPending } = useAdminActivityLogs(params);
  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedBranchId, categoryFilter, actorFilter]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Activity Logs -{" "}
          <span className="text-brand-color-500">{branchName}</span>
        </h1>
        <p className="text-gray-500">
          Track all actions performed by staff, customers, and system events
        </p>
      </div>

      {/* Filters */}
      <div className="flex max-w-5xl gap-3">
        <SelectField
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={CATEGORY_OPTIONS.map((opt) => ({
            label: opt.label,
            value: opt.value,
          }))}
        />
        <SelectField
          label="Actor"
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          options={ACTOR_OPTIONS.map((opt) => ({
            label: opt.label,
            value: opt.value,
          }))}
        />
      </div>

      {/* Table */}
      <ActivityLogsTable logs={logs} isPending={isPending} />

      {/* Pagination */}
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

export default ActivityLogsPage;
