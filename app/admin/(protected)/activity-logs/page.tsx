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

      {/* Table */}
      <ActivityLogsTable
        logs={logs}
        isPending={isPending}
        actorFilter={actorFilter}
        setActorFilter={setActorFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

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
