"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { InputField, SelectField } from "@/components/ui/FormComponents";
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
import type {
  CustomerFilter,
  CustomerSortBy,
  CustomersListResponse,
} from "@/types/CustomerAccountType";
import CustomerDetailModal from "./components/CustomerDetailModal";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { IconButton } from "@/components/ui/buttons";
import { formatCurrency, formatDate } from "@/helper/formatter";
import { AppImage } from "@/components/AppImage";
import SectionHeader from "../../components/SectionHeader";

const FILTER_OPTIONS: { value: CustomerFilter; label: string }[] = [
  { value: "all", label: "All Customers" },
  { value: "active", label: "Active" },
  { value: "new", label: "New (30 days)" },
  { value: "vip", label: "VIP (₱10k+)" },
  { value: "banned", label: "Suspended" },
  { value: "deleted", label: "Deleted" },
];

const SORT_OPTIONS: { value: CustomerSortBy; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest_spent", label: "Highest Spent" },
  { value: "most_orders", label: "Most Orders" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "name_desc", label: "Name (Z–A)" },
];

const CustomersPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [sort, setSort] = useState<CustomerSortBy>("newest");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  const queryString = buildQueryString({ page, limit, sort, filter, search });

  const {
    data: response,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["customers", page, limit, search, filter, sort],
    queryFn: () =>
      apiClient.get<CustomersListResponse>(`/admin/customers${queryString}`),
  });

  const customerList = useMemo(() => response?.data ?? [], [response?.data]);
  const pagination = response?.pagination;
  const summary = response?.summary;

  // Average customer value computed from current page data
  const average = useMemo(() => {
    const totalRevenue = customerList.reduce(
      (sum, c) => sum + (c.totalSpent ?? 0),
      0,
    );
    return customerList.length > 0 ? totalRevenue / customerList.length : 0;
  }, [customerList]);

  const handleSearch = () => {
    setPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as CustomerFilter);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value as CustomerSortBy);
    setPage(1);
  };

  const customerHeaders = [
    "Customer",
    "Contact",
    "Total Orders",
    "Total Spent",
    "Status",
    "Join Date",
    "Actions",
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Customers Management"
        subTitle="View and manage customer information"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {(
          [
            {
              label: "Total Customers",
              value:
                summary?.totalCustomers ??
                pagination?.total ??
                customerList.length,
            },
            {
              label: "VIP Customers",
              value: summary?.vipCustomers ?? 0,
            },
            {
              label: "Avg. Value",
              value: Math.round(average),
              isCurrency: true,
            },
            {
              label: "New (30 days)",
              value: summary?.newCustomers ?? 0,
            },
            {
              label: "Deleted Accounts",
              value: summary?.deletedCustomers ?? 0,
            },
          ] as StatCardProps[]
        ).map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
      {/* ── Table ── */}

      <TableCard>
        <TableCardHeader title="Recent Customers" />
        <TableToolbar>
          <div className="flex  gap-2 w-full max-w-lg">
            <SelectField
              name="filter"
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              options={FILTER_OPTIONS.map((f) => ({
                value: f.value,
                label: f.label,
              }))}
            />
            <SelectField
              name="sort"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              options={SORT_OPTIONS.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />
          </div>
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
        </TableToolbar>
        {isLoading ? (
          <TableSkeleton
            columns={customerHeaders.length}
            headers={customerHeaders}
          />
        ) : isError ? (
          <FetchError
            error={
              error instanceof Error
                ? error
                : new Error("Failed to load customers")
            }
            onRetry={refetch}
            description="Something went wrong while fetching the customer list."
          />
        ) : customerList.length === 0 ? (
          <TableEmptyState icon="Ban" title="No customers found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {customerHeaders.map((head) => (
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
              {customerList.map((customer) => {
                const isBanned = customer.banned === true;
                return (
                  <TableRow
                    key={customer._id}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    {/* Customer Name + Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3 mx-auto max-w-60 min-w-44">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                          <AppImage
                            src={customer.image ?? ""}
                            alt={`${customer.firstName} photo`}
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-800 truncate">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-xs text-stone-400 font-mono truncate">
                            {customer._id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    {/* Contact */}
                    <TableCell>
                      <div>
                        <p className="text-sm text-stone-700">
                          {customer.email ?? "--"}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {customer.phone ?? "--"}
                        </p>
                      </div>
                    </TableCell>
                    {/* Total Orders */}
                    <TableCell className="text-center">
                      <span className="text-sm font-semibold text-stone-800">
                        {customer.totalOrders ?? 0}
                      </span>
                    </TableCell>
                    {/* Total Spent */}
                    <TableCell className="text-center">
                      <span className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </TableCell>
                    {/* Status */}
                    <TableCell className="text-center">
                      {customer.isDeleted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-lg bg-stone-200 text-stone-600">
                          <DynamicIcon name="UserX" size={12} />
                          Deleted
                        </span>
                      ) : isBanned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-lg bg-red-100 text-red-600">
                          <DynamicIcon name="Ban" size={12} />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-lg bg-emerald-100 text-emerald-700">
                          <DynamicIcon name="UserCheck" size={12} />
                          Active
                        </span>
                      )}
                      {customer.isDeleted && customer.scheduledDeletionAt && (
                        <p className="text-[10px] text-stone-400 mt-1">
                          Purges{" "}
                          {formatDate(customer.scheduledDeletionAt, {
                            time: false,
                          })}
                        </p>
                      )}
                    </TableCell>
                    {/* Join Date */}
                    <TableCell className="text-center">
                      <span className="text-sm text-stone-600">
                        {formatDate(customer.createdAt)}
                      </span>
                    </TableCell>
                    {/* Actions */}
                    <TableCell className="text-center">
                      <IconButton
                        onClick={() =>
                          customer._id && setSelectedCustomerId(customer._id)
                        }
                        variant="underline"
                        text="View Details"
                        className="text-xs"
                        title="View customer details"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableCard>

      {/* ── Pagination ── */}
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

      {/* ── Customer Detail Modal ── */}
      {selectedCustomerId && (
        <CustomerDetailModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </section>
  );
};

export default CustomersPage;
