import { syne } from "@/app/font";
import { DynamicIcon } from "@/lib/DynamicIcon";
import { OrdersApiResponse } from "@/types/OrderTypes";
import { ORDER_STATUSES, OrderStatus } from "@/types/orderConstants";
import { format } from "date-fns";
import { OrderItemImage } from "../components/OrderItemImage";
import { useRouter } from "next/navigation";
import { PAYMENT_STATUSES } from "@/types/paymentConstants";
import { useOrderState } from "./hooks/useOrderState";

interface GuestOrderModalProps {
  order: OrdersApiResponse["data"][number] | null;
  onPayOrder: () => void;
  onCancelOrder: () => void;
  onBuyAgain: (items: any[]) => void;
  isLoading: boolean;
}

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-800" },
  preparing: { bg: "bg-blue-100", text: "text-blue-800" },
  ready: { bg: "bg-green-100", text: "text-green-800" },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700" },
  cancelled: { bg: "bg-slate-100", text: "text-slate-700" },
  failed: { bg: "bg-red-100", text: "text-red-700" },
  expired: { bg: "bg-red-100", text: "text-red-700" },
};

/** Derive a human-readable payment status label + badge style. */
function getPaymentBadge(order: GuestOrderModalProps["order"]) {
  if (!order) return null;

  const paymentMethod = order.paymentInfo?.paymentMethod;
  const paymentStatus = order.paymentInfo?.paymentStatus;

  if (paymentMethod === "maya") {
    if (paymentStatus === PAYMENT_STATUSES.PAYMENT_SUCCESS) {
      return { label: "Paid", bg: "bg-green-100", text: "text-green-700" };
    }
    if (paymentStatus === PAYMENT_STATUSES.PAYMENT_FAILED) {
      return {
        label: "Payment failed",
        bg: "bg-red-100",
        text: "text-red-700",
      };
    }
    // pending / unknown Maya state
    return {
      label: "Awaiting payment",
      bg: "bg-amber-100",
      text: "text-amber-700",
    };
  }

  // COD — status is driven by the order, not a payment gateway
  if (order.status === ORDER_STATUSES.PENDING) {
    return {
      label: "Awaiting confirmation",
      bg: "bg-amber-100",
      text: "text-amber-700",
    };
  }
  if (order.status === ORDER_STATUSES.COMPLETED) {
    return {
      label: "Paid on delivery",
      bg: "bg-green-100",
      text: "text-green-700",
    };
  }
  if (order.status === ORDER_STATUSES.CANCELLED) {
    return { label: "Cancelled", bg: "bg-slate-100", text: "text-slate-600" };
  }

  return {
    label: "Cash on delivery",
    bg: "bg-slate-100",
    text: "text-slate-600",
  };
}

function OrderActions({
  order,
  onPayOrder,
  onCancelOrder,
  onBuyAgain,
  isLoading,
}: {
  order: GuestOrderModalProps["order"];
  onPayOrder: () => void;
  onCancelOrder: () => void;
  onBuyAgain: (items: any[]) => void;
  isLoading: boolean;
}) {
  
  if (!order) return null;

  const router = useRouter();
  const actions = useOrderState(order);
  if (!actions) return null;

  const { needPayment, canCancel, canBuyAgain, needsReview } = actions;

  return (
    <div className="border-t border-slate-100 px-5 py-4 flex flex-col gap-2">
      {needPayment && (
        <button
          onClick={onPayOrder}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          {isLoading ? (
            <>
              <DynamicIcon name="Loader" size={15} className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <DynamicIcon name="CreditCard" size={15} />
              Pay now
            </>
          )}
        </button>
      )}

      {needsReview && (
        <button
          onClick={() => router.push(`/orders/${order._id}/review`)}
          className="w-full flex items-center justify-center gap-2 bg-brand-color-500 hover:bg-brand-color-600 active:bg-brand-color-900 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <DynamicIcon name="Star" size={15} />
          Leave Review
        </button>
      )}

      {canBuyAgain && (
        <button
          onClick={() => onBuyAgain(order.items)}
          className="w-full flex items-center justify-center gap-2 bg-green-800 hover:bg-green-700 active:bg-green-900 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <DynamicIcon name="RotateCcw" size={15} />
          Order again
        </button>
      )}

      {canCancel && (
        <button
          onClick={onCancelOrder}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 text-sm font-semibold py-2.5 rounded-xl border border-red-200 transition-colors"
        >
          {isLoading ? (
            <>
              <DynamicIcon name="Loader" size={15} className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <DynamicIcon name="X" size={15} />
              Cancel order
            </>
          )}
        </button>
      )}
    </div>
  );
}

export const GuestOrderModal = ({
  order,
  onPayOrder,
  onCancelOrder,
  onBuyAgain,
  isLoading,
}: GuestOrderModalProps) => {
  if (!order) return null;

  const statusStyle = STATUS_STYLES[order.status as OrderStatus] ?? {
    bg: "bg-slate-100",
    text: "text-slate-700",
  };

  const paymentBadge = getPaymentBadge(order);

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = order.total.totalAmount - subtotal;

  return (
    <div className={`${syne.className}`}>
      {/* Status + Date */}
      <div className="flex items-center gap-2 px-5 pb-4">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle.bg} ${statusStyle.text}`}
        >
          {order.status}
        </span>
        <span className="text-xs text-slate-400">
          Placed {format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}
        </span>
      </div>

      {/* Items */}
      <div className="border-t border-slate-100 px-5 py-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Items ordered
        </p>
        <div className="flex flex-col gap-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {item.image ? (
                  <div className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0">
                    <OrderItemImage image={item.image} name={item.name} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <DynamicIcon
                      name="Package"
                      size={16}
                      className="text-slate-400"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {item.name}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-800">
                  ₱{(item.price * item.quantity).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">×{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>₱{subtotal.toLocaleString()}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm text-slate-500">
              <span>Delivery fee</span>
              <span>₱{deliveryFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[15px] font-semibold text-slate-800 pt-2 border-t border-slate-100 mt-1">
            <span>Total</span>
            <span>₱{order.total.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="border-t border-slate-100 px-5 py-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Payment
        </p>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center">
            <DynamicIcon
              name="CreditCard"
              size={14}
              className="text-slate-500"
            />
          </div>
          <span className="text-sm text-slate-700">
            {order.paymentInfo?.method?.type ?? "—"}
          </span>
          {paymentBadge && (
            <span
              className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${paymentBadge.bg} ${paymentBadge.text}`}
            >
              {paymentBadge.label}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <OrderActions
        order={order}
        onPayOrder={onPayOrder}
        onCancelOrder={onCancelOrder}
        onBuyAgain={onBuyAgain}
        isLoading={isLoading}
      />
    </div>
  );
};
