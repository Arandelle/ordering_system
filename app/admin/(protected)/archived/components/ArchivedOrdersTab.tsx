"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { InputField } from "@/components/ui/FormComponents";
import { FetchError } from "@/components/ui/FetchError";
import Pagination from "@/components/ui/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";
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
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { IconButton } from "@/components/ui/buttons";
import { formatCurrency, formatDate } from "@/helper/formatter";
import { getPaymentMethodLabel } from "@/helper/paymentMethodLabel";
import { PaginationMeta } from "@/utils/query-helpers";
import { OrderStatus } from "@/types/orderConstants";

type ArchivedOrder = {
  _id: string;
  status: OrderStatus;
  fulfillmentType: string;
  createdAt: string;
  deletedAt: string;
  paymentInfo: {
    firstName: string;
    lastName: string;
    referenceNumber: string;
    paymentMethod: "cod" | "maya";
  };
  branchSnapshot?: {
    name: string;
  };
  total: {
    totalAmount: number;
  };
};

type ArchivedOrdersResponse = {
  data: ArchivedOrder[];
  pagination: PaginationMeta;
};

const ArchivedOrdersTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const queryString = buildQueryString({ page, limit, search });

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["archived-orders", page, limit, search],
    queryFn: () =>
      apiClient.get<ArchivedOrdersResponse>(
        `/admin/orders/archived${queryString}`,
      ),
  });

  const archivedList = useMemo(() => response?.data ?? [], [response?.data]);
  const pagination = response?.pagination;

  const handleSearch = () => {
    setPage(1);
  };

  const headers = [
    "Customer",
    "Reference",
    "Total",
    "Method",
    "Branch",
    "Status",
    "Deleted On",
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
        <TableCardHeader title="Archived orders" />
        <TableToolbar>
          <div className="w-full max-w-lg">
            <InputField
              placeholder="Search by name, reference, email, or branch..."
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
          <TableSkeleton columns={headers.length} headers={headers} />
        ) : error ? (
          <FetchError
            error={
              error instanceof Error
                ? error
                : new Error("Failed to load archived orders")
            }
            onRetry={() => window.location.reload()}
            description="Something went wrong while fetching the archived orders list."
          />
        ) : archivedList.length === 0 ? (
          <TableEmptyState icon="Archive" title="No archived orders found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((head) => (
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
              {archivedList.map((order) => {
                const fullname = [
                  order.paymentInfo.firstName,
                  order.paymentInfo.lastName,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <TableRow
                    key={order._id}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    {/* Customer */}
                    <TableCell className="text-center">
                      <p className="text-sm font-semibold text-stone-800 truncate capitalize">
                        {fullname || "Customer"}
                      </p>
                    </TableCell>
                    {/* Reference */}
                    <TableCell className="text-center">
                      <span className="text-xs font-mono text-stone-500">
                        {order.paymentInfo.referenceNumber ?? "—"}
                      </span>
                    </TableCell>
                    {/* Total */}
                    <TableCell className="text-center">
                      <span className="text-sm font-semibold text-stone-800">
                        {formatCurrency(order.total.totalAmount)}
                      </span>
                    </TableCell>
                    {/* Method */}
                    <TableCell className="text-center">
                      <span className="text-xs font-medium text-stone-600">
                        {getPaymentMethodLabel(
                          order.paymentInfo.paymentMethod,
                          order.fulfillmentType,
                        )}
                      </span>
                    </TableCell>
                    {/* Branch */}
                    <TableCell className="text-center">
                      <span className="text-xs text-stone-500">
                        {order.branchSnapshot?.name ?? "—"}
                      </span>
                    </TableCell>
                    {/* Status */}
                    <TableCell className="text-center">
                      <StatusBadge status={order.status} />
                    </TableCell>
                    {/* Deleted On */}
                    <TableCell className="text-center">
                      <span className="text-sm text-stone-600">
                        {formatDate(order.deletedAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
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
    </div>
  );
};

export default ArchivedOrdersTab;
