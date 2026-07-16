"use client";

import { OrderItemImage } from "@/app/customer/components/OrderItemImage";
import { OrderActions } from "@/app/customer/orders/components/OrderActions";
import LoadingPage from "@/components/ui/LoadingPage";
import StatusBadge from "@/components/ui/StatusBadge";
import { useOrderBase } from "@/hooks/api/shared/useOrdersBase";
import { FULFILLMENT_TYPE, ORDER_STATUSES } from "@/types/orderConstants";
import { useState } from "react";
import { DynamicIcon } from "./ui/DynamicIcon";
import { OrderItem, OrderType } from "@/types/OrderTypes";
import { buildEmbedUrl } from "@/lib/google-maps";
import { IconButton } from "./ui/buttons";
import { formatCurrency } from "@/helper/formatCurrency";
import {
  addMoney,
  multiplyMoney,
  roundMoney,
  subtractMoney,
} from "@/lib/money";
import { cn } from "@/lib/utils";
import { formatDate } from "@/helper/formatDate";

interface OrderDetailsProps {
  orderId: string;
  role: "admin" | "customer" | "guest";
  variant: "modal" | "page";
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const fulfillmentTheme = {
  pickup: {
    card: "border-blue-200 bg-blue-50/40",
    iconWrapper: "bg-blue-100",
    icon: "text-blue-600",
    iconName: "Store",
    label: "text-blue-500",
    badge: "bg-blue-500 text-white",
  },
  delivery: {
    card: "border-orange-200 bg-orange-50/40",
    iconWrapper: "bg-orange-100",
    icon: "text-orange-600",
    iconName: "Truck",
    label: "text-orange-500",
    badge: "bg-orange-500 text-white",
  },
} as const;

const paymentMethodBadge = {
  maya: "bg-green-100 text-green-700",
  cash: "bg-orange-100 text-orange-700",
} as const;

// Human-readable labels for timeline keys
const timelineLabelMap: Record<string, string> = {
  paidAt: "Paid",
  preparingAt: "Preparing",
  dispatchedAt: "Out for delivery",
  readyAt: "Ready for pickup",
  completedAt: "Completed",
  cancelledAt: "Cancelled",
  failedAt: "Failed",
  expiredAt: "Expired",
};

const paymentStatusBadge = {
  paid: {
    wrapper: "border-green-200 bg-green-50 text-green-700",
    dot: "bg-green-500",
    label: "Paid",
  },
  awaitingPayment: {
    wrapper: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    label: "Awaiting payment",
  },
  unpaid: {
    wrapper: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
    label: "Unpaid",
  },
} as const;

// ─── Reusable Sub-components ──────────────────────────────────────────────────

const PaymentStatusPill = ({
  variant,
}: {
  variant: keyof typeof paymentStatusBadge;
}) => {
  const s = paymentStatusBadge[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        s.wrapper,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
};

/** Collapsible card with toggle header and expandable content */
const SectionCard = ({
  section,
  title,
  expanded,
  onToggle,
  children,
}: {
  section: string;
  title: string;
  expanded: boolean;
  onToggle: (section: string) => void;
  children: React.ReactNode;
}) => (
  <div className="bg-white">
    <IconButton
      onClick={() => onToggle(section)}
      text={title}
      icon={{
        name: expanded ? "ChevronUp" : "ChevronDown",
        size: 16,
        position: "right",
      }}
      variant="ghost"
      className={cn(
        "w-full flex justify-start",
        expanded && "text-brand-color-500",
      )}
    />
    {expanded && (
      <div className="border-t border-gray-100 py-3 px-2">{children}</div>
    )}
  </div>
);

/** Timeline event dot with label and date */
const TimelineEntry = ({ label, date }: { label: string; date: string }) => (
  <div className="relative flex items-center gap-3">
    <div className="w-3.5 h-3.5 rounded-full bg-gray-200 border-2 border-white shrink-0 z-1" />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="text-[11px] text-gray-300">{formatDate(date)}</p>
    </div>
  </div>
);

/** Simple label-value row for details */
const InfoRow = ({
  label,
  value,
  labelClassName,
  valueClassName,
  className,
}: {
  label: React.ReactNode | string;
  value: React.ReactNode | string;
  labelClassName?: string;
  valueClassName?: string;
  className?: string;
}) => (
  <div className={cn("flex justify-between items-start py-1.5", className)}>
    <span className={cn("text-xs text-gray-400", labelClassName)}>{label}</span>
    <span className={cn("text-sm text-gray-700 text-right", valueClassName)}>{value}</span>
  </div>
);

/** Order item row with image, quantity badge, modifiers, and price breakdown */
const OrderItemRow = ({ item }: { item: OrderItem }) => {
  const modifiers = item.modifierSelections ?? [];
  const hasModifiers = modifiers.length > 0;

  // Compute upgrade total and base price for combo/set items (mirrors CartDrawer logic)
  const upgradeTotal = hasModifiers
    ? roundMoney(
        modifiers.reduce(
          (sum, group) =>
            addMoney(
              sum,
              group.items.reduce(
                (gSum, modItem) =>
                  addMoney(
                    gSum,
                    multiplyMoney(modItem.upgradePrice, modItem.quantity),
                  ),
                0,
              ),
            ),
          0,
        ),
      )
    : 0;
  const basePrice = hasModifiers
    ? subtractMoney(item.price, upgradeTotal)
    : item.price;

  return (
    <div className="flex gap-3 py-1">
      {item.image && (
        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 ring-1 ring-gray-100">
          <OrderItemImage image={item.image} name={item.name} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="uppercase font-semibold text-gray-800 truncate">
            {item.name}
          </p>
          <div className="flex items-center gap-2 shrink-0 mr-2">
            {item.quantity > 1 && (
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-bold rounded-md px-1.5 py-0.5 min-w-[24px]">
                  ×{item.quantity}
                </span>
                {hasModifiers && (
                  <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                    {item.quantity} sets ordered
                  </span>
                )}
              </div>
            )}
            <div className="text-right">
              <p className="font-bold text-gray-800">
                {formatCurrency(multiplyMoney(item.price, item.quantity))}
              </p>
              {item.quantity > 1 && (
                <p className="text-[11px] text-gray-400">
                  {formatCurrency(item.price)} each
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-60 text-wrap">
          <p className="text-xs font-thin italic text-gray-500">
            {item.description ?? "No description"}
          </p>
        </div>

        {/* Combo/set: modifier selections + price breakdown */}
        {hasModifiers && (
          <div className="mt-2">
            <div className="space-y-1.5 border-l-2 border-orange-200 pl-3">
              {modifiers.map((group, gi) => (
                <div key={gi}>
                  <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    {group.groupName}
                  </p>
                  {group.items.map((modItem, mi) => (
                    <div
                      key={mi}
                      className="flex justify-between text-xs ml-1"
                    >
                      <span className="text-gray-500">
                        {modItem.label ?? modItem.name}
                        <span className="text-gray-400">
                          {" "}(×{modItem.quantity})
                        </span>
                      </span>
                      <span className="text-gray-400 shrink-0 ml-2">
                        {modItem.upgradePrice > 0
                          ? `+${formatCurrency(multiplyMoney(modItem.upgradePrice, modItem.quantity))}`
                          : "Included in price"}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Price breakdown: base + upgrades = unit price */}
            <div className="mt-2 bg-gray-50 rounded-lg p-2 space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Base price</span>
                <span>{formatCurrency(basePrice)}</span>
              </div>
              {upgradeTotal > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Upgrades</span>
                  <span>+{formatCurrency(upgradeTotal)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-1 flex justify-between text-xs font-semibold text-gray-700">
                <span>Unit price</span>
                <span>{formatCurrency(item.price)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/** Customer info card */
const CustomerCard = ({
  firstName,
  lastName,
  email,
  phone,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
        <DynamicIcon name="UserIcon" size={14} className="text-gray-400" />
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Customer
      </p>
    </div>
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-700">
        {firstName} {lastName}
      </p>
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <DynamicIcon
          name="MailIcon"
          size={12}
          className="text-gray-300 shrink-0"
        />
        <span className="truncate">{email}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <DynamicIcon
          name="PhoneIcon"
          size={12}
          className="text-gray-300 shrink-0"
        />
        <span>{phone}</span>
      </div>
    </div>
  </div>
);

/** Fulfillment (pickup/delivery) card with themed styles */
const FulfillmentCard = ({
  isPickup,
  isAdmin,
  order,
  estimatedTime,
}: {
  isPickup: boolean;
  isAdmin: boolean;
  order: OrderType;
  estimatedTime: string;
}) => {
  const theme = fulfillmentTheme[isPickup ? "pickup" : "delivery"];
  const label = isPickup ? "Pickup" : "Delivery";

  const { branchSnapshot, paymentInfo } = order;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 shadow-sm ${theme.card}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${theme.iconWrapper}`}
        >
          <DynamicIcon name={theme.iconName} size={14} className={theme.icon} />
        </div>
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${theme.label}`}
        >
          {label}
        </p>
        <span
          className={`ml-auto inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold shadow-sm ${theme.badge}`}
        >
          {branchSnapshot?.name}
        </span>
      </div>

      {/* Pickup: show branch address with directions link for all roles */}
      {isPickup && (branchSnapshot?.address || branchSnapshot?.location) && (
        <div className="flex flex-col gap-1 text-sm text-gray-600 mb-1">
          <span className="font-medium text-gray-700">
            {branchSnapshot?.address}
          </span>
          {branchSnapshot?.location?.coordinates && !isAdmin && (
            <a
              href={`https://www.google.com/maps?q=${branchSnapshot.location.coordinates[1]},${branchSnapshot.location.coordinates[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1 transition-colors w-fit"
            >
              <DynamicIcon name="MapPin" size={12} />
              Get directions
              <DynamicIcon name="ExternalLink" size={10} />
            </a>
          )}
        </div>
      )}

      {/* Delivery: full address + map link for admin; brief confirmation for customer */}
      {!isPickup && paymentInfo?.shippingAddress && (
        <div className="flex flex-col gap-1 text-sm text-gray-600 mb-1">
          {isAdmin ? (
            <>
              <span className="font-medium text-gray-700">
                {paymentInfo?.shippingAddress.line1}
                {paymentInfo?.shippingAddress.line2 && (
                  <span className="text-gray-400">
                    , {paymentInfo?.shippingAddress.line2}
                  </span>
                )}
              </span>
              <span>
                {paymentInfo?.shippingAddress.city},{" "}
                {paymentInfo?.shippingAddress.province}{" "}
                {paymentInfo?.shippingAddress.postalCode}
              </span>
              {paymentInfo?.shippingAddress.country && (
                <span className="text-xs text-gray-300">
                  {paymentInfo?.shippingAddress.country}
                </span>
              )}
              {paymentInfo?.shippingAddress.landmark && (
                <span className="text-xs text-gray-400 mt-0.5">
                  Landmark: {paymentInfo?.shippingAddress.landmark}
                </span>
              )}
              {paymentInfo?.shippingAddress.coordinates?.lat &&
                paymentInfo?.shippingAddress.coordinates?.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${paymentInfo?.shippingAddress.coordinates.lat},${paymentInfo?.shippingAddress.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1 transition-colors w-fit"
                  >
                    <DynamicIcon name="MapPin" size={12} />
                    View on Google Maps
                    <DynamicIcon name="ExternalLink" size={10} />
                  </a>
                )}
            </>
          ) : (
            <span className="font-medium text-gray-700">
              {paymentInfo?.shippingAddress.line1}
              {paymentInfo?.shippingAddress.line2 && (
                <span className="text-gray-400">
                  , {paymentInfo?.shippingAddress.line2}
                </span>
              )}
              , {paymentInfo?.shippingAddress.city},{" "}
              {paymentInfo?.shippingAddress.province}{" "}
              {paymentInfo?.shippingAddress.postalCode}
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">Est. {estimatedTime}</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const OrderDetailsModal = ({ orderId, role, variant }: OrderDetailsProps) => {
  const {
    data: orderToView,
    isLoading,
    isError,
    error,
  } = useOrderBase(role, orderId);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    items: true,
    totals: true,
    payment: true,
    timeline: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ─── Destructure orderToView ──────────────────────────────────────────────

  const status = orderToView?.status;
  const items = orderToView?.items ?? [];
  const notes = orderToView?.notes;
  const timeline = orderToView?.timeline;
  const estimatedTime = orderToView?.estimatedTime ?? "—";

  const paymentInfo = orderToView?.paymentInfo;
  const referenceNumber = paymentInfo?.referenceNumber ?? "—";
  const customerEmail = paymentInfo?.customerEmail ?? "—";
  const customerPhone = paymentInfo?.customerPhone ?? "—";
  const firstName = paymentInfo?.firstName ?? "—";
  const lastName = paymentInfo?.lastName ?? "—";
  const paymentId = paymentInfo?.paymentId;
  const paymentStatus = paymentInfo?.paymentStatus ?? "—";
  const paidAt = paymentInfo?.paidAt;
  const paymentMethod = paymentInfo?.method;
  const shippingAddress = paymentInfo?.shippingAddress;

  const total = orderToView?.total;
  const vatableSales = total?.vatableSales ?? 0;
  const totalAmount = total?.totalAmount ?? 0;
  const deliveryFeeAmount = total?.deliveryFeeAmount ?? 0;
  const deliveryDistanceKm = total?.deliveryDistanceKm;
  const freeDeliveryApplied = total?.freeDeliveryApplied;
  const discountAmount = total?.discountAmount ?? 0;
  const voucherDiscountAmount = total?.voucherDiscountAmount ?? 0;
  const productDiscountPromotions = total?.productDiscountPromotions ?? [];
  const orderDiscountPromotionName = total?.orderDiscountPromotionName;
  const orderDiscountAmount = total?.orderDiscountAmount ?? 0;
  const discountCode = total?.discountCode;
  const vatAmount = total?.vatAmount ?? 0;

  const isMaya = paymentInfo?.paymentMethod === "maya";
  const isMayaPaid = paymentInfo?.paymentConfirmed === true;
  const isPickup = orderToView?.fulfillmentType === FULFILLMENT_TYPE.PICKUP;

  // ─── Render ───────────────────────────────────────────────────────────────

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
          {/* ── Header Card ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-xs text-gray-400">Reference</p>
                <p className="text-sm font-mono font-semibold text-gray-800 truncate">
                  {referenceNumber}
                </p>
                {role === "admin" && (
                  <p className="text-[11px] text-gray-300 font-mono truncate">
                    {orderToView._id}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <StatusBadge status={status!} />
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {isMayaPaid && <PaymentStatusPill variant="paid" />}
                  {status === ORDER_STATUSES.PENDING_PAYMENT &&
                    isMaya &&
                    !isMayaPaid && (
                      <PaymentStatusPill variant="awaitingPayment" />
                    )}
                </div>
                {status === ORDER_STATUSES.PENDING && isMaya && !isMayaPaid && (
                  <PaymentStatusPill variant="unpaid" />
                )}
              </div>
            </div>
          </div>

          {/* ── Actions (customer / guest only) ── */}
          {(role === "guest" || role === "customer") && (
            <OrderActions order={orderToView} />
          )}

          {/* Map iframe: branch location for pickup (customer only), shipping address for delivery (admin only) */}
          {(() => {
            const isAdmin = role === "admin";

            // Pickup: customer needs directions to branch; admin already knows their own branch
            // Delivery: admin needs to see shipping location; customer knows their own address
            if (isPickup && isAdmin) return null;
            if (!isPickup && !isAdmin) return null;

            const branchCoords =
              orderToView?.branchSnapshot?.location?.coordinates;
            const lat = isPickup
              ? branchCoords?.[1]
              : shippingAddress?.coordinates?.lat;
            const lng = isPickup
              ? branchCoords?.[0]
              : shippingAddress?.coordinates?.lng;

            return lat && lng ? (
              <iframe
                src={buildEmbedUrl(lat, lng)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[0.2] contrast-[1.1] transition-all duration-300 group-hover:grayscale-0"
              />
            ) : null;
          })()}

          {/* ── Info Grid: Customer (admin only) + Fulfillment ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomerCard
              firstName={firstName}
              lastName={lastName}
              email={customerEmail}
              phone={customerPhone}
            />

            <FulfillmentCard
              isPickup={isPickup}
              isAdmin={role === "admin"}
              order={orderToView}
              estimatedTime={estimatedTime}
            />
          </div>

          {/* ── Order Items ── */}
          <SectionCard
            section="items"
            title={`Order items (${items.reduce((sum, i) => sum + i.quantity, 0)})`}
            expanded={expandedSections.items}
            onToggle={toggleSection}
          >
            <div className="flex flex-col gap-3">
              {items.map((item, index) => (
                <OrderItemRow key={index} item={item} />
              ))}
            </div>
          </SectionCard>

          {/* ── Order Summary ── */}
          <SectionCard
            section="totals"
            title="Order Summary"
            expanded={expandedSections.totals}
            onToggle={toggleSection}
          >
            <div className="flex flex-col gap-1">
              {/* Itemized line totals — shows where the subtotal comes from */}
              {items.map((item, i) => (
                <InfoRow
                  key={i}
                  label={`${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`}
                  value={formatCurrency(multiplyMoney(item.price, item.quantity))}
                  className="py-1"
                />
              ))}

              {/* Subtotal */}
              <InfoRow
                label="Subtotal"
                value={formatCurrency(vatableSales)}
                labelClassName="font-medium text-gray-600"
                valueClassName="font-medium text-gray-700"
                className="border-t border-gray-100 mt-1 pt-2"
              />

              {/* Delivery fee */}
              {!isPickup && deliveryFeeAmount > 0 && (
                <InfoRow
                  label={`Delivery Fee${deliveryDistanceKm != null ? ` (${deliveryDistanceKm.toFixed(1)} km)` : ""}`}
                  value={formatCurrency(deliveryFeeAmount)}
                />
              )}
              {!isPickup && deliveryFeeAmount === 0 && freeDeliveryApplied && (
                <InfoRow
                  label={`Delivery Fee${deliveryDistanceKm != null ? ` (${deliveryDistanceKm.toFixed(1)} km)` : ""}`}
                  value="FREE"
                  valueClassName="text-green-600 font-bold"
                />
              )}

              {/* Discounts */}
              {discountAmount > 0 && (
                <InfoRow
                  label="Discount"
                  value={`-${formatCurrency(discountAmount)}`}
                  valueClassName="text-green-600 font-medium"
                />
              )}

              {/* Detailed discount breakdown (when expanded) */}
              {expandedSections.totals && (
                <>
                  {voucherDiscountAmount > 0 && (
                    <InfoRow
                      label="Voucher Discount"
                      value={`-${formatCurrency(voucherDiscountAmount)}`}
                      valueClassName="text-green-600 text-xs"
                    />
                  )}
                  {productDiscountPromotions.length > 0 && (
                    <>
                      <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider mt-2">
                        Item Promos
                      </p>
                      {productDiscountPromotions.map((p, i) => (
                        <InfoRow
                          key={i}
                          label={`${p.productName} (${p.name})`}
                          value={`-${formatCurrency(p.discountAmount)}`}
                          labelClassName="text-xs"
                          valueClassName="text-green-600 text-xs"
                        />
                      ))}
                    </>
                  )}
                  {orderDiscountPromotionName && (
                    <InfoRow
                      label={`Promo: ${orderDiscountPromotionName}`}
                      value={`-${formatCurrency(orderDiscountAmount)}`}
                      labelClassName="text-xs"
                      valueClassName="text-green-600 text-xs"
                    />
                  )}
                  {discountCode && (
                    <InfoRow
                      label="Discount Code"
                      value={discountCode}
                      valueClassName="font-mono text-xs text-gray-400"
                    />
                  )}
                </>
              )}

              {/* VAT */}
              {vatAmount > 0 && (
                <InfoRow
                  label="VAT (12%)"
                  value={formatCurrency(vatAmount)}
                  valueClassName="text-xs text-gray-500"
                  className="border-t border-gray-100 mt-1 pt-2"
                />
              )}

              {/* Grand total */}
              <InfoRow
                label="Total"
                value={formatCurrency(totalAmount)}
                labelClassName="text-sm font-semibold text-gray-800"
                valueClassName="text-lg font-bold text-gray-900"
                className="border-t border-gray-200 mt-1 pt-2"
              />
            </div>
          </SectionCard>

          {/* ── Payment ── */}
          <SectionCard
            section="payment"
            title="Payment"
            expanded={expandedSections.payment}
            onToggle={toggleSection}
          >
            <div className="flex flex-col gap-0">
              <InfoRow
                label="Method"
                value={
                  isMaya ? "Maya" : isPickup ? "Cash on Pickup" : "Cash on Delivery"
                }
                valueClassName={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  isMaya ? paymentMethodBadge.maya : paymentMethodBadge.cash,
                )}
              />
              {paymentMethod && (
                <InfoRow
                  label="Card"
                  value={`${paymentMethod.scheme}${paymentMethod.last4 ? ` ••••${paymentMethod.last4}` : ""}`}
                  valueClassName="font-medium capitalize"
                />
              )}
              <InfoRow
                label="Reference"
                value={referenceNumber}
                valueClassName="font-mono text-xs text-gray-500"
              />
              {paymentId && role === "admin" && (
                <InfoRow
                  label="Payment ID"
                  value={paymentId}
                  valueClassName="font-mono text-xs text-gray-500 truncate max-w-45 block"
                />
              )}
              <InfoRow
                label="Status"
                value={paymentStatus}
                valueClassName="font-mono text-xs text-gray-500"
              />
              <InfoRow
                label="Paid At"
                value={formatDate(paidAt)}
                valueClassName="text-xs text-gray-500"
              />
            </div>
          </SectionCard>

          {/* ── Timeline ── */}
          {(timeline && Object.keys(timeline).length > 0) ||
            (orderToView?.createdAt && (
              <SectionCard
                section="timeline"
                title="Timeline"
                expanded={expandedSections.timeline}
                onToggle={toggleSection}
              >
                <div className="relative flex flex-col gap-3 pl-4">
                  <div className="absolute left-1.75 top-2 bottom-2 w-px bg-gray-100" />

                  {/* Placed entry — always the first event */}
                  {orderToView?.createdAt && (
                    <TimelineEntry label="Placed" date={orderToView.createdAt} />
                  )}

                  {Object.entries(timeline ?? {})
                    .filter(([_, value]) => value)
                    .map(([key, value]) => (
                      <TimelineEntry
                        key={key}
                        label={timelineLabelMap[key] ?? key.replace("At", "")}
                        date={value as string}
                      />
                    ))}
                </div>
              </SectionCard>
            ))}

          {/* ── Note ── */}
          {notes && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-px">📝</span>
                <div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                    Note
                  </p>
                  <p className="text-sm text-amber-800/80 leading-relaxed">
                    {notes}
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
      <div className="min-h-screen">
        <div className="mx-auto max-w-2xl bg-gray-50 p-2 rounded-3xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default OrderDetailsModal;
