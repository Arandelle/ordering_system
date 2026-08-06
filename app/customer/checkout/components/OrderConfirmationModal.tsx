"use client";

import Modal from "@/components/ui/Modal";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { IconButton } from "@/components/ui/buttons";
import MapPreview from "./MapPreview";
import { normalizePsgcName } from "@/lib/psgcAddress";
import { formatCurrency } from "@/helper/formatter/";
import { getCartKey } from "@/contexts/CartContext";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";
import type { Branch } from "@/types/branch";
import type { OrderFormState } from "../FormSchema";
import type { CartItem } from "@/types/MenuTypes";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedBranch: Branch | null;
  orderDetails: OrderFormState;
  cartItems: CartItem[];
  displayTotalPrice: number;
  isPlacingOrder: boolean;
}

/**
 * Confirmation dialog shown before the order is placed.
 * Rendered at the CheckoutShell level so it sits above the sticky header
 * in the DOM tree — avoids z-index stacking-context traps inside CartList.
 */
export default function OrderConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedBranch,
  orderDetails,
  cartItems,
  displayTotalPrice,
  isPlacingOrder,
}: OrderConfirmationModalProps) {
  if (!isOpen) return null;

  const isDelivery = orderDetails.fulfillmentType === FULFILLMENT_TYPE.DELIVERY;
  const isDineIn = orderDetails.fulfillmentType === FULFILLMENT_TYPE.DINE_IN;
  const isPickup = orderDetails.fulfillmentType === FULFILLMENT_TYPE.PICKUP;

  const { line1, line2, city, province, coordinates, pinnedCity, pinnedLine2 } =
    orderDetails.shippingAddress;

  return (
    <Modal
      title="Confirm your order"
      subTitle="Please review the details below before placing your order."
      onClose={onClose}
      contentClassName="p-4 md:p-8"
    >
      <div className="space-y-4">
        {/* Branch & fulfillment */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <DynamicIcon name="Store" size={15} className="text-slate-400 shrink-0" />
            <span className="text-sm font-medium text-slate-700">
              {selectedBranch?.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DynamicIcon name="Truck" size={15} className="text-slate-400 shrink-0" />
            <span className="text-sm text-slate-600 capitalize">
              {orderDetails.fulfillmentType}
            </span>
          </div>
          {isDelivery && (
            <div className="flex items-start gap-2">
              <DynamicIcon name="MapPin" size={15} className="mt-0.5 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600">
                {[line1, line2, city, province].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {isDineIn && orderDetails.reservation && (
            <div className="flex items-center gap-2">
              <DynamicIcon name="Calendar" size={15} className="text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600">
                {new Date(orderDetails.reservation.scheduledAt).toLocaleString("en-PH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                · {orderDetails.reservation.partySize} guest{orderDetails.reservation.partySize !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {isPickup && orderDetails.pickupTime && (
            <div className="flex items-center gap-2">
              <DynamicIcon name="Clock" size={15} className="text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600">
                Pickup:{" "}
                {new Date(orderDetails.pickupTime).toLocaleString("en-PH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Map preview */}
        {isDelivery && coordinates && (
          <MapPreview
            lat={coordinates.lat}
            lng={coordinates.lng}
            className="mt-0"
            iframeClassName="h-40"
          />
        )}
        {(isPickup || isDineIn) && selectedBranch?.location && (
          <MapPreview
            isBranch
            lat={selectedBranch.location.coordinates[1]}
            lng={selectedBranch.location.coordinates[0]}
            className="mt-0"
            iframeClassName="h-40"
          />
        )}

        {/* Pin-vs-dropdown mismatch warnings */}
        {isDelivery && pinnedCity && city && normalizePsgcName(pinnedCity) !== normalizePsgcName(city) && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
            <DynamicIcon name="AlertTriangle" size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <p>Your pin is in &ldquo;{pinnedCity}&rdquo; but the selected city is &ldquo;{city}&rdquo;. The dropdown fields will be used as your delivery address.</p>
          </div>
        )}
        {isDelivery && pinnedLine2 && line2 && normalizePsgcName(pinnedLine2) !== normalizePsgcName(line2) && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
            <DynamicIcon name="AlertTriangle" size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <p>Your pin is in &ldquo;{pinnedLine2}&rdquo; but the selected barangay is &ldquo;{line2}&rdquo;. Make sure the dropdown matches your actual delivery location.</p>
          </div>
        )}

        {/* Items summary */}
        <div className="rounded-xl border border-slate-200 px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
          </p>
          <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
            {cartItems.map((item) => (
              <div key={getCartKey(item)} className="flex justify-between py-1.5 text-sm">
                <span className="text-slate-600 truncate mr-2">
                  {item.quantity}× {item.name}
                </span>
                <span className="text-slate-800 font-medium shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-slate-700">Total</span>
          <span className="text-lg font-bold text-brand-color-500">
            {formatCurrency(displayTotalPrice)}
          </span>
        </div>

        {/* Confirm button */}
        <IconButton
          onClick={onConfirm}
          disabled={isPlacingOrder}
          text={isPlacingOrder ? "Placing Order..." : "Confirm & Place Order"}
          icon={{
            name: isPlacingOrder ? "Loader2" : "CheckCircle",
            className: isPlacingOrder ? "animate-spin" : "",
          }}
          className="bg-brand-color-500 hover:bg-brand-color-600 rounded-xl py-3 w-full"
        />
      </div>
    </Modal>
  );
}
