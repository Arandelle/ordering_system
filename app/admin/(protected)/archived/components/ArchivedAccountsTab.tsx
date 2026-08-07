"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { InputField } from "@/components/ui/FormComponents";
import { FetchError } from "@/components/ui/FetchError";
import Pagination from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCard,
  TableCardHeader,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
  TableToolbar,
} from "@/components/ui/table";
import { apiClient } from "@/lib/apiClient";
import { buildQueryString } from "@/utils/buildQueryString";
import { StatCard, StatCardProps } from "@/components/ui/StatCard";
import type { ArchivedCustomersListResponse } from "@/types/CustomerAccountType";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { IconButton } from "@/components/ui/buttons";
import ArchivedCustomerDetailModal from "@/app/admin/(protected)/customers/components/ArchivedCustomerDetailModal";
import { formatCurrency, formatDate } from "@/helper/formatter";

const ArchivedAccountsTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedArchivedId, setSelectedArchivedId] = useState<string | null>(
    null,
  );

  const queryString = buildQueryString({ page, limit, search });

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["archived-customers", page, limit, search],
    queryFn: () =>
      apiClient.get<ArchivedCustomersListResponse>(
        `/admin/customers/archived${queryString}`,
      ),
  });

  const archivedList = useMemo(() => response?.data ?? [], [response?.data]);
  const pagination = response?.pagination;

  const handleSearch = () => {
    setPage(1);
  };

  const archivedHeaders = [
    "Customer",
    "Contact",
    "Orders",
    "Total Spent",
    "Deleted On",
    "Purge Date",
    "Actions",
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(
          [
            {
              label: "Total Archived",
              value: pagination?.total ?? archivedList.length,
            },
            {
              label: "On This Page",
              value: archivedList.length,
            },
          ] as StatCardProps[]
        ).map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Table */}
      <TableCard>
        <TableCardHeader title="Archived accounts" />
        <TableToolbar>
          <div className="w-full max-w-lg">
            <InputField
              placeholder="Search by name, email, or phone..."
              leftIcon={<DynamicIcon name="Search" size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              rightElement={
                <IconButton
                  onClick={handleSearch}
                  text="Search"
                  variant="ghost"
                />
              }
            />
          </div>
        </TableToolbar>
        {isLoading ? (
          <TableSkeleton
            columns={archivedHeaders.length}
            headers={archivedHeaders}
          />
        ) : error ? (
          <FetchError
            error={
              error instanceof Error
                ? error
                : new Error("Failed to load archived customers")
            }
            onRetry={() => window.location.reload()}
            description="Something went wrong while fetching the archived customer list."
          />
        ) : archivedList.length === 0 ? (
          <TableEmptyState icon="Archive" title="No archived accounts found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {archivedHeaders.map((head) => (
                  <TableHead
                    key={head}
                    className="text-xs font-semibold uppercase tracking-wider text-center"
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-stone-100">
              {archivedList.map((archived) => (
                <TableRow
                  key={archived._id}
                  className="hover:bg-stone-50 transition-colors"
                >
                  {/* Customer Name + Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3 mx-auto max-w-60 min-w-44">
                      <div className="w-10 h-10 rounded-full bg-stone-300 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                        <AppImage
                          src={archived.image ?? ""}
                          alt={`${archived.firstName} photo`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">
                          {archived.firstName} {archived.lastName}
                        </p>
                        <p className="text-xs text-stone-400 font-mono truncate">
                          {archived.originalUserId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  {/* Contact */}
                  <TableCell>
                    <div>
                      <p className="text-sm text-stone-700">
                        {archived.email ?? "--"}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {archived.phone ?? "--"}
                      </p>
                    </div>
                  </TableCell>
                  {/* Total Orders */}
                  <TableCell className="text-center">
                    <span className="text-sm font-semibold text-stone-800">
                      {archived.stats?.totalOrders ?? 0}
                    </span>
                  </TableCell>
                  {/* Total Spent */}
                  <TableCell className="text-center">
                    <span className="text-sm font-semibold text-stone-600">
                      {formatCurrency(archived.stats?.totalSpent)}
                    </span>
                  </TableCell>
                  {/* Deleted On */}
                  <TableCell className="text-center">
                    <span className="text-sm text-stone-600">
                      {formatDate(archived.deletedAt)}
                    </span>
                  </TableCell>
                  {/* Purge Date */}
                  <TableCell className="text-center">
                    <span className="text-sm text-stone-600">
                      {formatDate(archived.scheduledDeletionAt, {
                        time: false,
                      })}
                    </span>
                  </TableCell>
                  {/* Actions */}
                  <TableCell className="text-center">
                    <IconButton
                      onClick={() => setSelectedArchivedId(archived._id)}
                      text="View Details"
                      variant="underline"
                      className="text-xs"
                      title="View archived user details"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      {/* Archived Customer Detail Modal */}
      {selectedArchivedId && (
        <ArchivedCustomerDetailModal
          archivedId={selectedArchivedId}
          onClose={() => setSelectedArchivedId(null)}
        />
      )}
    </div>
  );
};

export default ArchivedAccountsTab;
