"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { InputField } from "@/components/ui/FormComponents";
import { FetchError } from "@/components/ui/FetchError";
import LoadingPage from "@/components/ui/LoadingPage";
import Pagination from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/apiClient";
import { buildQueryString } from "@/utils/buildQueryString";
import { StatCard, StatCardProps } from "@/components/ui/StatCard";
import type { ArchivedCustomersListResponse } from "@/types/CustomerAccountType";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { IconButton } from "@/components/ui/buttons";
import ArchivedCustomerDetailModal from "../components/ArchivedCustomerDetailModal";
import { formatCurrency, formatDate } from "@/helper/formatter";

const ArchivedCustomersPage = () => {
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

  if (isLoading) return <LoadingPage />;
  if (error)
    return (
      <FetchError
        error={
          error instanceof Error
            ? error
            : new Error("Failed to load archived customers")
        }
        onRetry={() => window.location.reload()}
        description="Something went wrong while fetching the archived customer list."
      />
    );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          Archived Accounts
        </h1>
        <p className="text-stone-500">
          Permanently deleted customer accounts preserved for historical records
        </p>
      </div>

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

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
        <div className="w-full md:w-96">
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
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
              {archivedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={archivedHeaders.length}>
                    <div className="flex flex-col items-center text-stone-400 gap-2 py-12">
                      <DynamicIcon name="Archive" size={28} />
                      <p className="text-sm">No archived accounts found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                archivedList.map((archived) => (
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
                        \{formatCurrency(archived.stats?.totalSpent)}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
    </section>
  );
};

export default ArchivedCustomersPage;
