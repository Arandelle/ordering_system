"use client";

import { OrderItemImage } from "@/app/customer/components/OrderItemImage";
import { OrderActions } from "@/app/customer/orders/components/OrderActions";
import LoadingPage from "@/components/ui/LoadingPage";
import StatusBadge from "@/components/ui/StatusBadge";
import { useOrderBase } from "@/hooks/api/shared/useOrdersBase";
import { FULFILLMENT_TYPE, ORDER_STATUSES } from "@/types/orderConstants";
import { useState } from "react";
import { DynamicIcon } from "./ui/DynamicIcon";

interface OrderDetailsProps {
  orderId: string;
  role: "admin" | "customer" | "guest";
  variant: "modal" | "page";
}

const OrderDetailsModal = ({ orderId, role, variant }: OrderDetailsProps) => {
  const {
    data: orderToView,
    isLoading,
    isError,
    error,
  } = useOrderBase(role, orderId);

  // Track which detail sections are expanded
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    items: true,
    totals: false,
    payment: true,
    timeline: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const vatableSales = orderToView?.total?.vatableSales ?? 0;
  const totalAmount = orderToView?.total?.totalAmount ?? 0;

  const isMaya =
    orderToView && orderToView.paymentInfo.paymentMethod === "maya";
  // Derived from API's paymentConfirmed field — computed server-side from paymentStatus + paymentId
  const isMayaPaid = orderToView?.paymentInfo.paymentConfirmed === true;
  const fulfillmentLabel =
    orderToView?.fulfillmentType === FULFILLMENT_TYPE.PICKUP
      ? "Pickup"
      : "Delivery";

  const SectionToggle = ({
    section,
    icon,
    title,
    badge,
  }: {
    section: string;
    icon: React.ReactNode;
    title: string;
    badge?: string;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50/80 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm font-semibold text-stone-700">{title}</span>
        {badge && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-stone-100 text-[11px] font-semibold text-stone-500">
            {badge}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <DynamicIcon name="ChevronUp" size={16} className="text-stone-400" />
      ) : (
        <DynamicIcon name="ChevronDown" size={16} className="text-stone-400" />
      )}
    </button>
  );

  const SectionCard = ({
    section,
    icon,
    title,
    badge,
    children,
  }: {
    section: string;
    icon: React.ReactNode;
    title: string;
    badge?: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      <SectionToggle
        section={section}
        icon={icon}
        title={title}
        badge={badge}
      />
      {expandedSections[section] && (
        <div className="border-t border-stone-100 px-4 py-3">{children}</div>
      )}
    </div>
  );

  const InfoRow = ({
    label,
    value,
  }: {
    label: React.ReactNode;
    value: React.ReactNode;
  }) => (
    <div className="flex justify-between items-start py-1.5">
      <span className="text-xs text-stone-400">{label}</span>
      <span className="text-sm text-stone-700 text-right">{value}</span>
    </div>
  );

  const content = (
    <>
      {isLoading && (
        <div className="relative flex items-center justify-center py-12 h-[50vh]">
          <LoadingPage />
        </div>
      )}
      {isError && (
        <p className="text-center text-sm text-red-500 py-8">
          {error?.message ?? "Failed to fetch order"}
        </p>
      )}
      {orderToView && (
        <div className="flex flex-col gap-5">
          {/** If view by guest - show buttons */}
          {role === "guest" && <OrderActions order={orderToView} />}

          {/* ── Header Card ── */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-xs text-stone-400">Reference</p>
                <p className="text-sm font-mono font-semibold text-stone-800 truncate">
                  {orderToView.paymentInfo?.referenceNumber ?? "—"}
                </p>
                <p className="text-[11px] text-stone-300 font-mono truncate">
                  {orderToView._id}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <StatusBadge status={orderToView.status ?? ""} />
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {(isMaya || !isMaya) && isMayaPaid && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Paid
                    </span>
                  )}
                  {orderToView.status === ORDER_STATUSES.PENDING_PAYMENT &&
                    isMaya &&
                    !isMayaPaid && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Awaiting payment
                      </span>
                    )}
                </div>
                {orderToView.status === ORDER_STATUSES.PENDING &&
                  isMaya &&
                  !isMayaPaid && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      Unpaid — needs review
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* ── Info Grid: Customer + Fulfillment side by side ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center">
                  <DynamicIcon
                    name="UserIcon"
                    size={14}
                    className="text-stone-400"
                  />
                </div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                  Customer
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-stone-700">
                  {orderToView.paymentInfo?.firstName ?? "—"}{" "}
                  {orderToView.paymentInfo?.lastName ?? "—"}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <DynamicIcon
                    name="MailIcon"
                    size={12}
                    className="text-stone-300 shrink-0"
                  />
                  <span className="truncate">
                    {orderToView.paymentInfo?.customerEmail ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <DynamicIcon
                    name="PhoneIcon"
                    size={12}
                    className="text-stone-300 shrink-0"
                  />
                  <span>{orderToView.paymentInfo?.customerPhone ?? "—"}</span>
                </div>
              </div>
            </div>

            {/* Fulfillment + Address card — themed to stand out with colored border and bg tint */}
            <div
              className={`relative overflow-hidden rounded-xl border p-4 shadow-sm ${
                orderToView.fulfillmentType === FULFILLMENT_TYPE.PICKUP
                  ? "border-blue-200 bg-blue-50/40"
                  : "border-orange-200 bg-orange-50/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    orderToView.fulfillmentType === FULFILLMENT_TYPE.PICKUP
                      ? "bg-blue-100"
                      : "bg-orange-100"
                  }`}
                >
                  <DynamicIcon
                    name={
                      orderToView.fulfillmentType === FULFILLMENT_TYPE.PICKUP
                        ? "Store"
                        : "Truck"
                    }
                    size={14}
                    className={
                      orderToView.fulfillmentType === FULFILLMENT_TYPE.PICKUP
                        ? "text-blue-600"
                        : "text-orange-600"
                    }
                  />
                </div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    orderToView.fulfillmentType === FULFILLMENT_TYPE.PICKUP
                      ? "text-blue-500"
                      : "text-orange-500"
                  }`}
                >
                  {fulfillmentLabel}
                </p>
                <span
                  className={`ml-auto inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold shadow-sm ${
                    orderToView.fulfillmentType === FULFILLMENT_TYPE.PICKUP
                      ? "bg-blue-500 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {orderToView.fulfillmentType === FULFILLMENT_TYPE.PICKUP
                    ? "Pickup"
                    : "Delivery"}
                </span>
              </div>

              {/* Pickup: show branch name */}
              {orderToView.fulfillmentType === FULFILLMENT_TYPE.PICKUP &&
                orderToView.branchSnapshot?.name && (
                  <p className="text-sm text-blue-700 font-medium mb-1">
                    {orderToView.branchSnapshot.name}
                  </p>
                )}

              {/* Delivery: show full shipping address */}
              {orderToView.fulfillmentType !== FULFILLMENT_TYPE.PICKUP &&
                orderToView.paymentInfo?.shippingAddress && (
                  <div className="flex flex-col gap-1 text-sm text-stone-600 mb-1">
                    <span className="font-medium text-stone-700">
                      {orderToView.paymentInfo.shippingAddress.line1}
                      {orderToView.paymentInfo.shippingAddress.line2 && (
                        <span className="text-stone-400">
                          , {orderToView.paymentInfo.shippingAddress.line2}
                        </span>
                      )}
                    </span>
                    <span>
                      {orderToView.paymentInfo.shippingAddress.city},{" "}
                      {orderToView.paymentInfo.shippingAddress.province}{" "}
                      {orderToView.paymentInfo.shippingAddress.postalCode}
                    </span>
                    <span className="text-xs text-stone-300">
                      {orderToView.paymentInfo.shippingAddress.country}
                    </span>
                    {orderToView.paymentInfo.shippingAddress.landmark && (
                      <span className="text-xs text-stone-400 mt-0.5">
                        Landmark:{" "}
                        {orderToView.paymentInfo.shippingAddress.landmark}
                      </span>
                    )}
                    {orderToView.paymentInfo.shippingAddress.coordinates?.lat &&
                      orderToView.paymentInfo.shippingAddress.coordinates
                        ?.lng && (
                        <a
                          href={`https://www.google.com/maps?q=${orderToView.paymentInfo.shippingAddress.coordinates.lat},${orderToView.paymentInfo.shippingAddress.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1 transition-colors w-fit"
                        >
                          <DynamicIcon name="MapPin" size={12} />
                          View on Google Maps
                          <DynamicIcon name="ExternalLink" size={10} />
                        </a>
                      )}
                  </div>
                )}

              <p className="text-xs text-stone-400 mt-2">
                Est. {orderToView.estimatedTime ?? "—"}
              </p>
            </div>
          </div>

          {/* ── Order Items ── */}
          <SectionCard
            section="items"
            icon={
              <div className="w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center">
                <DynamicIcon
                  name="Utensils"
                  size={14}
                  className="text-stone-400"
                />
              </div>
            }
            title="Items"
            badge={String(orderToView.items.length)}
          >
            <div className="flex flex-col gap-3">
              {orderToView.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-1">
                  {item.image && (
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 ring-1 ring-stone-100">
                      <OrderItemImage image={item.image} name={item.name} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      ₱{item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-700 shrink-0">
                    ₱{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Order Summary ── */}
          <SectionCard
            section="totals"
            icon={
              <div className="w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center">
                <DynamicIcon
                  name="CircleDollarSign"
                  size={14}
                  className="text-stone-400"
                />
              </div>
            }
            title="Order Summary"
          >
            <div className="flex flex-col gap-1.5">
              <InfoRow
                label="Subtotal"
                value={`₱${vatableSales.toLocaleString()}`}
              />
              {orderToView.fulfillmentType !== FULFILLMENT_TYPE.PICKUP &&
                (orderToView.total?.deliveryFeeAmount ?? 0) > 0 && (
                  <InfoRow
                    label={
                      <span>
                        Delivery Fee
                        {orderToView.total.deliveryDistanceKm != null && (
                          <span className="text-[10px] text-stone-300 ml-1">
                            ({orderToView.total.deliveryDistanceKm.toFixed(1)}{" "}
                            km)
                          </span>
                        )}
                      </span>
                    }
                    value={`₱${orderToView.total.deliveryFeeAmount?.toLocaleString()}`}
                  />
                )}
              {orderToView.fulfillmentType !== FULFILLMENT_TYPE.PICKUP &&
                (orderToView.total?.deliveryFeeAmount ?? 0) === 0 &&
                orderToView.total?.freeDeliveryApplied && (
                  <InfoRow
                    label={
                      <span>
                        Delivery Fee
                        {orderToView.total.deliveryDistanceKm != null && (
                          <span className="text-[10px] text-stone-300 ml-1">
                            ({orderToView.total.deliveryDistanceKm.toFixed(1)}{" "}
                            km)
                          </span>
                        )}
                      </span>
                    }
                    value={
                      <span className="text-green-600 font-bold">FREE</span>
                    }
                  />
                )}
              {(orderToView.total?.discountAmount ?? 0) > 0 && (
                <InfoRow
                  label="Discount"
                  value={
                    <span className="text-green-600 font-medium">
                      -₱{orderToView.total.discountAmount?.toLocaleString()}
                    </span>
                  }
                />
              )}
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-stone-100">
                <span className="text-sm font-semibold text-stone-800">
                  Total
                </span>
                <span className="text-lg font-bold text-stone-900">
                  ₱{totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Expanded detailed breakdown */}
              {expandedSections.totals && (
                <div className="mt-2 pt-2 border-t border-stone-100 flex flex-col gap-1.5">
                  {(orderToView.total?.voucherDiscountAmount ?? 0) > 0 && (
                    <InfoRow
                      label="Voucher Discount"
                      value={
                        <span className="text-green-600 text-xs">
                          -₱
                          {orderToView.total.voucherDiscountAmount?.toLocaleString()}
                        </span>
                      }
                    />
                  )}
                  {orderToView.total?.productDiscountPromotions &&
                    orderToView.total.productDiscountPromotions.length > 0 && (
                      <>
                        <span className="text-[10px] font-semibold text-stone-300 uppercase tracking-wider mt-1">
                          Item Promos
                        </span>
                        {orderToView.total.productDiscountPromotions.map(
                          (p, i) => (
                            <InfoRow
                              key={i}
                              label={
                                <span className="text-xs">
                                  {p.productName}
                                  <span className="text-stone-300 ml-1">
                                    ({p.name})
                                  </span>
                                </span>
                              }
                              value={
                                <span className="text-green-600 text-xs">
                                  -₱{p.discountAmount?.toLocaleString()}
                                </span>
                              }
                            />
                          ),
                        )}
                      </>
                    )}
                  {orderToView.total?.orderDiscountPromotionName && (
                    <InfoRow
                      label={
                        <span className="text-xs">
                          Promo: {orderToView.total.orderDiscountPromotionName}
                        </span>
                      }
                      value={
                        <span className="text-green-600 text-xs">
                          -₱
                          {orderToView.total.orderDiscountAmount?.toLocaleString()}
                        </span>
                      }
                    />
                  )}
                  {orderToView.total?.discountCode && (
                    <InfoRow
                      label="Discount Code"
                      value={
                        <span className="font-mono text-xs text-stone-400">
                          {orderToView.total.discountCode}
                        </span>
                      }
                    />
                  )}
                  {(orderToView.total?.vatAmount ?? 0) > 0 && (
                    <InfoRow
                      label="VAT"
                      value={
                        <span className="text-xs text-stone-400">
                          ₱{orderToView.total.vatAmount?.toLocaleString()}
                        </span>
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Payment ── */}
          <SectionCard
            section="payment"
            icon={
              <div className="w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center">
                <DynamicIcon
                  name="CreditCard"
                  size={14}
                  className="text-stone-400"
                />
              </div>
            }
            title="Payment"
          >
            <div className="flex flex-col gap-0">
              <InfoRow
                label="Method"
                value={
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      orderToView.paymentInfo?.paymentMethod === "maya"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {orderToView.paymentInfo?.paymentMethod === "maya"
                      ? "Maya"
                      : orderToView.fulfillmentType === FULFILLMENT_TYPE.PICKUP
                        ? "Cash on Pickup"
                        : "Cash on Delivery"}
                  </span>
                }
              />
              {orderToView.paymentInfo?.method && (
                <InfoRow
                  label="Card"
                  value={
                    <span className="font-medium capitalize">
                      {orderToView.paymentInfo.method.scheme}{" "}
                      {orderToView.paymentInfo.method.last4 && (
                        <span className="font-mono text-stone-400">
                          ••••{orderToView.paymentInfo.method.last4}
                        </span>
                      )}
                    </span>
                  }
                />
              )}
              <InfoRow
                label="Reference"
                value={
                  <span className="font-mono text-xs text-stone-500">
                    {orderToView.paymentInfo?.referenceNumber ?? "—"}
                  </span>
                }
              />
              {orderToView.paymentInfo?.paymentId && (
                <InfoRow
                  label="Payment ID"
                  value={
                    <span
                      className="font-mono text-xs text-stone-500 truncate max-w-45 block"
                      title={orderToView.paymentInfo.paymentId}
                    >
                      {orderToView.paymentInfo.paymentId}
                    </span>
                  }
                />
              )}
              <InfoRow
                label="Status"
                value={
                  <span className="font-mono text-xs text-stone-500">
                    {orderToView.paymentInfo?.paymentStatus ?? "—"}
                  </span>
                }
              />
              <InfoRow
                label="Paid At"
                value={
                  <span className="text-xs text-stone-500">
                    {orderToView.paymentInfo?.paidAt
                      ? new Date(
                          orderToView.paymentInfo.paidAt,
                        ).toLocaleString()
                      : "—"}
                  </span>
                }
              />
            </div>
          </SectionCard>

          {/* ── Timeline ── */}
          {orderToView.timeline &&
            Object.keys(orderToView.timeline).length > 0 && (
              <SectionCard
                section="timeline"
                icon={
                  <div className="w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center">
                    <DynamicIcon
                      name="Clock"
                      size={14}
                      className="text-stone-400"
                    />
                  </div>
                }
                title="Timeline"
              >
                <div className="relative flex flex-col gap-3 pl-4">
                  {/* Vertical line */}
                  <div className="absolute left-1.75 top-2 bottom-2 w-px bg-stone-100" />
                  {Object.entries(orderToView.timeline)
                    .filter(([_, value]) => value)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="relative flex items-center gap-3"
                      >
                        {/* Dot */}
                        <div className="w-3.5 h-3.5 rounded-full bg-stone-200 border-2 border-white shrink-0 z-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-stone-600 capitalize">
                            {key.replace("At", "")}
                          </p>
                          <p className="text-[11px] text-stone-300">
                            {new Date(value as string).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </SectionCard>
            )}

          {/* ── Note ── */}
          {orderToView.notes && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-px">📝</span>
                <div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                    Note
                  </p>
                  <p className="text-sm text-amber-800/80 leading-relaxed">
                    {orderToView.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (variant === "page") {
    return (
      <div className="min-h-screen bg-stone-100/60 px-4 py-8">
        <div className="mx-auto max-w-3xl">{content}</div>
      </div>
    );
  }

  return content;
};

export default OrderDetailsModal;
