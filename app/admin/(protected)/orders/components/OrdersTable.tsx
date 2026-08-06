"use client";

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
import { OrderType } from "@/types/OrderTypes";
import { OrderActionButton } from "./OrderActionButton";
import PermissionGuard from "@/lib/PermissionGuard";
import { formatDate, formatCurrency } from "@/helper/formatter";
import { useRouter } from "next/navigation";
import { FULFILLMENT_TYPE, ORDER_STATUSES } from "@/types/orderConstants";
import { IconButton } from "@/components/ui/buttons";
import { SearchBar } from "@/components/ui/SearchBar";
import { SelectField } from "@/components/ui/FormComponents";
import { FetchError } from "@/components/ui/FetchError";

// ─── Filter & sort option constants ──────────────────────────────────────────

const FULFILLMENT_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: FULFILLMENT_TYPE.DELIVERY, label: "Delivery" },
  { value: FULFILLMENT_TYPE.PICKUP, label: "Pickup" },
  { value: FULFILLMENT_TYPE.DINE_IN, label: "Dine-in / Reservation" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "total.totalAmount:desc", label: "Highest total" },
  { value: "total.totalAmount:asc", label: "Lowest total" },
];

interface OrdersTableProps {
  orders: OrderType[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  onRetry?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  filterOptions: { key: string; label: string }[];
  filterCounts?: Record<string, number>;
  fulfillmentTypeFilter: string;
  onFulfillmentTypeFilterChange: (value: string) => void;
  sortOption: string;
  onSortOptionChange: (value: string) => void;
  onResetFilters: () => void;
}

export default function OrdersTable({
  orders,
  isPending,
  isError,
  error,
  onRetry,
  searchQuery,
  onSearchChange,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  filterOptions,
  filterCounts,
  fulfillmentTypeFilter,
  onFulfillmentTypeFilterChange,
  sortOption,
  onSortOptionChange,
  onResetFilters,
}: OrdersTableProps) {
  const router = useRouter();

  const hasActiveFilters =
    statusFilter !== "all" ||
    fulfillmentTypeFilter !== "all" ||
    sortOption !== "default" ||
    searchQuery !== "";

  /** Payment status capsule — small pill showing Maya payment state */
  const PaymentStatusCapsule = (status: "awaiting" | "paid" | "unpaid") => {
    const styles = {
      paid: {
        text: "text-green-700",
        bg: "bg-green-50",
        pill: "bg-green-500",
        border: "border-green-200",
        title: "Paid",
      },
      awaiting: {
        text: "text-amber-700",
        bg: "bg-amber-50",
        pill: "bg-amber-500",
        border: "border-amber-200",
        title: "Awaiting",
      },
      unpaid: {
        text: "text-red-700",
        bg: "bg-red-50",
        pill: "bg-red-500",
        border: "border-red-200",
        title: "Unpaid",
      },
    };

    const s = styles[status];

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.border} ${s.bg} ${s.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${s.pill}`} />
        {s.title}
      </span>
    );
  };

  /** Returns fulfillment label and color for an order */
  const getFulfillmentInfo = (order: OrderType) => {
    const isPickup = order.fulfillmentType === FULFILLMENT_TYPE.PICKUP;
    const isDineIn = order.fulfillmentType === FULFILLMENT_TYPE.DINE_IN;
    const isDelivery = order.fulfillmentType === FULFILLMENT_TYPE.DELIVERY;

    // Orders without fulfillmentType stored in the DB (legacy data)
    if (!isPickup && !isDineIn && !isDelivery) {
      return {
        label: "N/A",
        style: "text-gray-400",
        isPickup: false,
      };
    }

    return {
      label: isDineIn ? "Reservation" : isPickup ? "Pickup" : "Delivery",
      style: isDineIn
        ? "text-indigo-500"
        : isPickup
          ? "text-blue-500"
          : "text-brand-color-500",
      isPickup,
    };
  };

  /**
   * Determines the Maya payment capsule to show for an order.
   * Returns null for COD orders (they use a separate paid indicator).
   */
  const getMayaPaymentCapsule = (order: OrderType) => {
    const isMaya = order.paymentInfo.paymentMethod === "maya";
    if (!isMaya) return null;

    if (order.paymentInfo.paymentConfirmed) {
      return PaymentStatusCapsule("paid");
    }
    if (order.status === ORDER_STATUSES.PENDING_PAYMENT) {
      return PaymentStatusCapsule("awaiting");
    }
    return PaymentStatusCapsule("unpaid");
  };

  /** Column definitions — width % is applied via table-layout: fixed */
  const ORDERS_HEADER = [
    { label: "Customer", width: "w-[20%]" },
    { label: "Total", width: "w-[12%]" },
    { label: "Fulfillment/Branch", width: "w-[18%]" },
    { label: "Status", width: "w-[15%]" },
    { label: "Actions", width: "w-[30%]" },
  ];

  return (
    <TableCard>
      <TableCardHeader
        title="Recent Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""} found`}
      />
      <TableToolbar className="flex-wrap">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onSearch={onSearch}
          placeholder="Search orders — customer name, branch, delivery, etc."
        />
        <div className="flex items-end gap-3 flex-1 min-w-0">
          <SelectField
            label="Status"
            options={filterOptions.map((option) => ({
              label:
                filterCounts?.[option.key] != null
                  ? `${option.label} ${filterCounts[option.key] > 0 ? `(${filterCounts[option.key]})` : ""}`
                  : option.label,
              value: option.key,
            }))}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          />
          <SelectField
            label="Fulfillment"
            value={fulfillmentTypeFilter}
            onChange={(e) => onFulfillmentTypeFilterChange(e.target.value)}
            options={FULFILLMENT_OPTIONS}
          />
          <SelectField
            label="Sort by"
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value)}
            options={SORT_OPTIONS}
          />
        </div>
        {hasActiveFilters && (
          <IconButton
            onClick={onResetFilters}
            variant="ghost"
            className="text-slate-500 hover:text-red-500 hover:bg-red-50 self-end mb-0.5"
            icon={{ name: "RotateCcw", size: 14 }}
            text="Reset"
            title="Clear all filters and sort"
          />
        )}
      </TableToolbar>

      {isPending ? (
        <TableSkeleton
          columns={ORDERS_HEADER.length}
          rows={10}
          headers={ORDERS_HEADER.map((c) => c.label)}
        />
      ) : isError ? (
        <FetchError
          error={
            error instanceof Error
              ? error
              : new Error("We couldn't load these products")
          }
          onRetry={onRetry ?? (() => {})}
        />
      ) : (
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              {ORDERS_HEADER.map((col, index) => (
                <TableHead
                  key={index}
                  className={`px-4 py-4 uppercase text-xs font-semibold tracking-wider text-center ${col.width}`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-stone-100 relative">
            {orders.length > 0 ? (
              orders.map((order) => {
                const isMaya = order.paymentInfo.paymentMethod === "maya";
                const oneDayMs = 24 * 60 * 60 * 1000;
                const isNewPaidOrder =
                  isMaya &&
                  order.paymentInfo.paymentConfirmed === true &&
                  order.status === ORDER_STATUSES.PENDING &&
                  Date.now() - new Date(order.createdAt).getTime() < oneDayMs;

                const {
                  label: fulfillmentLabel,
                  style: fulfillmentStyle,
                  isPickup,
                } = getFulfillmentInfo(order);

                const mayaCapsule = getMayaPaymentCapsule(order);
                const fullname = [
                  order.paymentInfo.firstName,
                  order.paymentInfo.lastName,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <TableRow
                    key={order._id}
                    className={`relative transition-colors ${
                      isNewPaidOrder
                        ? "bg-brand-color-50 hover:bg-brand-color-100"
                        : "hover:bg-stone-50"
                    }`}
                  >
                    {/* CUSTOMER */}
                    <TableCell className="px-4 py-4">
                      <div className="flex flex-col items-center gap-1">
                        {isNewPaidOrder && (
                          <span className="shrink-0 inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full animate-pulse">
                            New
                          </span>
                        )}
                        <div className="normal-case flex flex-col text-center">
                          <span className="text-base font-medium text-brand-color-500 truncate">
                            {fullname ?? "Customer Name"}
                          </span>
                          <span className="text-xs font-medium text-gray-600 truncate">
                            {order.paymentInfo.customerPhone ?? "--"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* TOTAL */}
                    <TableCell className="px-4 py-4">
                      <span className="text-sm font-semibold text-stone-800">
                        {formatCurrency(order.total.totalAmount)}
                      </span>
                    </TableCell>

                    {/* FULFILLMENT / BRANCH */}
                    <TableCell className="px-4 py-4 text-center">
                      <p
                        className={`text-xs font-semibold ${fulfillmentStyle}`}
                      >
                        {fulfillmentLabel}
                      </p>
                      {isPickup && order.pickupTime && (
                        <p className="text-xs text-blue-400 mt-0.5">
                          {formatDate(order.pickupTime)}
                        </p>
                      )}
                      <span className="text-xs text-stone-500">
                        {order.branchSnapshot?.name ?? "—"}
                      </span>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1.5 flex-wrap">
                          <StatusBadge status={order.status} />
                          {mayaCapsule}
                          {!isMaya &&
                            order.paymentInfo?.paymentId &&
                            PaymentStatusCapsule("paid")}
                        </div>
                        <span className="text-xs text-stone-400 text-start whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="px-4 py-4">
                      <div className="flex flex-wrap gap-2 items-center justify-end">
                        <PermissionGuard permission="orders.update">
                          <OrderActionButton order={order} role="admin" />
                        </PermissionGuard>
                        <IconButton
                          onClick={() => router.push(`/orders/${order._id}`)}
                          className="text-xs bg-blue-500 rounded-lg px-3"
                          title="View details"
                          text="View Details"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={ORDERS_HEADER.length}>
                  <TableEmptyState
                    title="No Products Found"
                    description="Try refreshing the page or use the search bar"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </TableCard>
  );
}
