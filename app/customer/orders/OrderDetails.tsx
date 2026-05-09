"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useOrder } from "@/hooks/api/useOrders";
import LoadingPage from "@/components/ui/LoadingPage";
import { formatDate } from "@/helper/formatDate";
import { OrderActionButton } from "@/app/admin/(protected)/orders/components/OrderActionButton";
import { ORDER_STATUSES, OrderStatus } from "@/types/orderConstants";
import { OrderType } from "@/types/OrderTypes";

/* ─── Types ──────────────────────────────────────────────────────────── */
interface OrderDetailsProps {
  orderId: string;
  variant?: "modal" | "page";
  role?: "admin" | "customer";
}

/* ─── Timeline config ────────────────────────────────────────────────── */
const TIMELINE_STEPS: {
  key: keyof NonNullable<OrderType["timeline"]>;
  label: string;
  icon: string;
  status: OrderStatus;
}[] = [
  { key: "paidAt",       label: "Payment confirmed", icon: "💳", status: ORDER_STATUSES.PAID },
  { key: "preparingAt",  label: "Preparing",          icon: "👨‍🍳", status: ORDER_STATUSES.PREPARING },
  { key: "readyAt",      label: "Ready",              icon: "✅", status: ORDER_STATUSES.READY },
  { key: "dispatchedAt", label: "Dispatched",         icon: "🚗", status: ORDER_STATUSES.DISPATCHED },
  { key: "completedAt",  label: "Completed",          icon: "🎉", status: ORDER_STATUSES.COMPLETED },
  { key: "cancelledAt",  label: "Cancelled",          icon: "❌", status: ORDER_STATUSES.CANCELLED },
  { key: "failedAt",     label: "Failed",             icon: "⚠️", status: ORDER_STATUSES.FAILED },
  { key: "expiredAt",    label: "Expired",            icon: "⏰", status: ORDER_STATUSES.EXPIRED },
];

const STATUS_PILL: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]:    "bg-amber-50 text-amber-700 border-amber-200",
  [ORDER_STATUSES.PAID]:       "bg-green-50 text-green-700 border-green-200",
  [ORDER_STATUSES.PREPARING]:  "bg-blue-50 text-blue-700 border-blue-200",
  [ORDER_STATUSES.READY]:      "bg-purple-50 text-purple-700 border-purple-200",
  [ORDER_STATUSES.DISPATCHED]: "bg-indigo-50 text-indigo-700 border-indigo-200",
  [ORDER_STATUSES.COMPLETED]:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  [ORDER_STATUSES.CANCELLED]:  "bg-red-50 text-red-700 border-red-200",
  [ORDER_STATUSES.FAILED]:     "bg-gray-100 text-gray-600 border-gray-200",
  [ORDER_STATUSES.EXPIRED]:    "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]:    "To pay",
  [ORDER_STATUSES.PAID]:       "Paid",
  [ORDER_STATUSES.PREPARING]:  "Preparing",
  [ORDER_STATUSES.READY]:      "Ready",
  [ORDER_STATUSES.DISPATCHED]: "Dispatched",
  [ORDER_STATUSES.COMPLETED]:  "Completed",
  [ORDER_STATUSES.CANCELLED]:  "Cancelled",
  [ORDER_STATUSES.FAILED]:     "Failed",
  [ORDER_STATUSES.EXPIRED]:    "Expired",
};

/* ─── Sub-components ─────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function OrderDetails({
  orderId,
  variant = "page",
  role = "customer",
}: OrderDetailsProps) {
  const { data: order, isLoading } = useOrder({ type: role === "admin" ? "admin" : "customer" }, orderId);
  const router = useRouter();
  const [showAllItems, setShowAllItems] = useState(false);
  const ITEMS_TO_SHOW = 3;

  useEffect(() => {
    if (!isLoading && !order && variant === "page") {
      router.push("/orders");
    }
  }, [isLoading, order, router, variant]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${variant === "modal" ? "min-h-[420px]" : "min-h-screen"}`}>
        <LoadingPage className="h-[50vh]" />
      </div>
    );
  }

  if (!order) return null;

  const isCod = order.paymentInfo?.paymentMethod === "cod";
  const isCodPending = isCod && order.status === ORDER_STATUSES.PENDING;
  const activeTimeline = TIMELINE_STEPS.filter((s) => order.timeline?.[s.key]);
  const itemsToShow = showAllItems ? order.items ?? [] : order.items?.slice(0, ITEMS_TO_SHOW) ?? [];
  const hasMoreItems = (order.items?.length ?? 0) > ITEMS_TO_SHOW;

  return (
    <div
      className={[
        "space-y-3",
        variant === "modal"
          ? "max-h-[calc(100vh-80px)] overflow-y-auto hide-scrollbar"
          : "min-h-screen max-w-2xl mx-auto px-4 py-8",
      ].join(" ")}
    >
      {/* ── Header ── */}
      <Card>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-mono text-[11px] text-gray-400 mb-0.5 tracking-wide">
              #{order.paymentInfo?.referenceNumber ?? order._id.slice(-8).toUpperCase()}
            </p>
            <p className="text-[13px] text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Payment method pill */}
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${isCod ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
              {isCod ? "COD" : "Maya"}
            </span>
            {/* Status pill */}
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_PILL[order.status]}`}>
              {isCodPending ? "Awaiting pickup" : STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>

        {/* Customer info */}
        <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
          <div>
            <p className="text-gray-400 text-[11px]">Name</p>
            <p className="text-gray-800 font-medium">
              {order.paymentInfo?.firstName} {order.paymentInfo?.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px]">Phone</p>
            <p className="text-gray-800 font-medium">{order.paymentInfo?.customerPhone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 text-[11px]">Email</p>
            <p className="text-gray-800 font-medium">{order.paymentInfo?.customerEmail}</p>
          </div>
        </div>

        {/* Estimated time */}
        {order.estimatedTime && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-[13px] text-gray-600">
            <span>⏱</span>
            <span>Estimated: <strong>{order.estimatedTime}</strong></span>
          </div>
        )}

        {/* Action button */}
        {role && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
            <OrderActionButton
              orderId={order._id}
              status={order.status}
              paymentMethod={order.paymentInfo?.paymentMethod}
              role={role}
            />
          </div>
        )}
      </Card>

      {/* ── Shipping address ── */}
      {order.paymentInfo?.shippingAddress && (
        <Card>
          <SectionLabel>Delivery address</SectionLabel>
          <div className="text-[13px] text-gray-700 space-y-0.5">
            <p className="font-medium">{order.paymentInfo.shippingAddress.line1}</p>
            {order.paymentInfo.shippingAddress.line2 && (
              <p className="text-gray-500">{order.paymentInfo.shippingAddress.line2}</p>
            )}
            <p className="text-gray-500">
              {order.paymentInfo.shippingAddress.city}, {order.paymentInfo.shippingAddress.province}{" "}
              {order.paymentInfo.shippingAddress.postalCode}
            </p>
            {order.paymentInfo.shippingAddress.landmark && (
              <p className="text-gray-400 text-[12px] mt-1">
                📍 Near: {order.paymentInfo.shippingAddress.landmark}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* ── Dispatch info ── */}
      {order.dispatchInfo?.riderName && order.status === ORDER_STATUSES.DISPATCHED && (
        <Card className="border-blue-100 bg-blue-50/40">
          <SectionLabel>Rider info</SectionLabel>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
            <div>
              <p className="text-gray-400 text-[11px]">Rider</p>
              <p className="text-gray-800 font-medium">{order.dispatchInfo.riderName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[11px]">Phone</p>
              <p className="text-gray-800 font-medium">{order.dispatchInfo.riderPhone}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[11px]">Vehicle</p>
              <p className="text-gray-800 font-medium capitalize">{order.dispatchInfo.vehicleType}</p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Timeline ── */}
      {activeTimeline.length > 0 && (
        <Card>
          <SectionLabel>Timeline</SectionLabel>
          <div className="space-y-3">
            {activeTimeline.map((step, i) => (
              <div key={step.key} className="flex items-start gap-3">
                {/* Connector line */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[14px] flex-shrink-0">
                    {step.icon}
                  </div>
                  {i < activeTimeline.length - 1 && (
                    <div className="w-px h-4 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="pt-1">
                  <p className="text-[13px] font-medium text-gray-800">{step.label}</p>
                  <p className="text-[11px] text-gray-400">{formatDate(order.timeline![step.key]!)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Items ── */}
      <Card>
        <SectionLabel>
          Items · {order.items?.length ?? 0}
        </SectionLabel>
        <div className="space-y-3">
          {itemsToShow.map((item, index) => (
            <div key={`${item._id}-${index}`} className="flex gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={item.image || "/images/harrison_logo.png"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  ₱{item.price.toLocaleString()} × {item.quantity}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[13px] font-semibold text-gray-800">
                  ₱{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Show more/less */}
        {hasMoreItems && (
          <button
            type="button"
            onClick={() => setShowAllItems(!showAllItems)}
            className="mt-3 w-full pt-3 border-t border-gray-100 text-[12px] text-brand-color-500 font-semibold hover:text-[#c13500] transition-colors"
          >
            {showAllItems
              ? "Show less"
              : `+ ${order.items!.length - ITEMS_TO_SHOW} more item${order.items!.length - ITEMS_TO_SHOW > 1 ? "s" : ""}`}
          </button>
        )}
      </Card>

      {/* ── Order summary ── */}
      <Card>
        <SectionLabel>Summary</SectionLabel>
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between text-gray-600">
            <span>VATable sales</span>
            <span className="font-medium text-gray-800">₱{order.total?.vatableSales?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>VAT (12%)</span>
            <span className="font-medium text-gray-800">₱{order.total?.vatAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-[15px] text-brand-color-500">
              ₱{order.total?.totalAmount?.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      {/* ── Branch info ── */}
      {order.branchSnapshot && (
        <Card>
          <SectionLabel>Branch</SectionLabel>
          <div className="text-[13px] space-y-0.5">
            <p className="font-medium text-gray-800">{order.branchSnapshot.name}</p>
            <p className="text-gray-500">{order.branchSnapshot.address}</p>
            <p className="text-gray-400">{order.branchSnapshot.contactNumber}</p>
          </div>
        </Card>
      )}

      {/* ── Payment method detail ── */}
      {order.paymentInfo?.method?.type && (
        <Card>
          <SectionLabel>Payment</SectionLabel>
          <div className="flex items-center justify-between text-[13px]">
            <div>
              <p className="font-medium text-gray-800 capitalize">{order.paymentInfo.method.description}</p>
              {order.paymentInfo.method.last4 && (
                <p className="text-gray-400 text-[12px]">•••• {order.paymentInfo.method.last4}</p>
              )}
            </div>
            {order.paymentInfo.method.scheme && (
              <span className="text-gray-400 uppercase text-[11px] font-semibold tracking-wide">
                {order.paymentInfo.method.scheme}
              </span>
            )}
          </div>
        </Card>
      )}

      {/* ── Notes ── */}
      {order.notes && (
        <Card className="border-yellow-100 bg-yellow-50/40">
          <SectionLabel>Note</SectionLabel>
          <p className="text-[13px] text-gray-700">{order.notes}</p>
        </Card>
      )}

      {/* Bottom padding for mobile */}
      <div className="h-4" />
    </div>
  );
}