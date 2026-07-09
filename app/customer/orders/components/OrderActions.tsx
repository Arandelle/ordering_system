import { OrderType } from "@/types/OrderTypes";
import { useRouter } from "next/navigation";
import { useOrderState } from "../hooks/useOrderState";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { useOrderActions } from "@/hooks/useOrderActions";
import CancelOrderModal from "./CancelOrderModal";
import { useState } from "react";

type Variant = "full" | "compact";

// ─── Full-width button (used in modal / detail page) ──────────────────────────

function FullButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Compact pill button (used in order card list) ────────────────────────────

function CompactButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OrderActions({
  order,
  variant = "full",
}: {
  order: OrderType | null;
  variant?: Variant;
}) {
  const {
    handlePayOrder,
    handleCancelOrder,
    handleBuyAgain,
    isLoading,
  } = useOrderActions();

  const router = useRouter();
  const actions = useOrderState(order);
  const [isCancelOrder, setIsCancelOrder] = useState(false);

  if (!order || !actions) return null;

  const { needPayment, canCancel, canBuyAgain, needsReview, hasReview } = actions;
  const reviewPath = `/orders/${order._id}/review`;

  const isFull = variant === "full";

  // ── Payment ────────────────────────────────────────────────────────────
  const payAction = needPayment && (
    isFull ? (
      <FullButton
        onClick={() => handlePayOrder(order._id)}
        disabled={isLoading}
        className="bg-slate-800 hover:bg-slate-700 text-white"
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
      </FullButton>
    ) : (
      <CompactButton
        onClick={() => handlePayOrder(order._id)}
        className="bg-green-50 border border-green-200 text-green-800 hover:bg-green-100"
      >
        <DynamicIcon name="ExternalLink" size={13} />
        Pay now
      </CompactButton>
    )
  );

  // ── Review ─────────────────────────────────────────────────────────────
  const reviewAction = needsReview && (
    isFull ? (
      <FullButton
        onClick={() => router.push(reviewPath)}
        className="bg-brand-color-500 hover:bg-brand-color-600 active:bg-brand-color-900 text-white"
      >
        <DynamicIcon name="Star" size={15} />
        Leave Review
      </FullButton>
    ) : (
      <CompactButton
        onClick={() => router.push(reviewPath)}
        className="bg-brand-color-500 text-white hover:bg-[#c53600]"
      >
        <DynamicIcon name="Star" size={13} />
        Leave review
      </CompactButton>
    )
  );

  // ── View / Edit Review ─────────────────────────────────────────────────
  const viewEditReviewAction = hasReview && (
    isFull ? (
      <FullButton
        onClick={() => router.push(reviewPath)}
        className="bg-brand-color-500 hover:bg-brand-color-600 active:bg-brand-color-900 text-white"
      >
        <DynamicIcon name="PenLine" size={15} />
        View / Edit Review
      </FullButton>
    ) : (
      <CompactButton
        onClick={() => router.push(reviewPath)}
        className="bg-brand-color-500 text-white hover:bg-[#c53600]"
      >
        <DynamicIcon name="PenLine" size={13} />
        View/Edit review
      </CompactButton>
    )
  );

  // ── Buy Again ──────────────────────────────────────────────────────────
  const buyAgainAction = canBuyAgain && (
    isFull ? (
      <FullButton
        onClick={() => handleBuyAgain(order.items)}
        className="bg-green-800 hover:bg-green-700 active:bg-green-900 text-white"
      >
        <DynamicIcon name="RotateCcw" size={15} />
        Order again
      </FullButton>
    ) : (
      <CompactButton
        onClick={() => handleBuyAgain(order.items)}
        className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        <DynamicIcon name="ShoppingCart" size={13} />
        Buy again
      </CompactButton>
    )
  );

  // ── Cancel ─────────────────────────────────────────────────────────────
  const cancelAction = canCancel && (
    isFull ? (
      <FullButton
        onClick={() => setIsCancelOrder(true)}
        disabled={isLoading}
        className="bg-white hover:bg-red-50 text-red-600 border border-red-200"
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
      </FullButton>
    ) : (
      <CompactButton
        onClick={() => setIsCancelOrder(true)}
        className="bg-white border border-red-200 text-red-700 hover:bg-red-50"
      >
        <DynamicIcon name="X" size={13} />
        Cancel
      </CompactButton>
    )
  );

  // ── Render layout ──────────────────────────────────────────────────────
  if (!needPayment && !needsReview && !hasReview && !canBuyAgain && !canCancel) return null;

  return (
    <>
      {isFull ? (
        <div className="flex flex-col gap-2">
          {payAction}{reviewAction}{viewEditReviewAction}{buyAgainAction}{cancelAction}
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          {payAction}{reviewAction}{viewEditReviewAction}{buyAgainAction}{cancelAction}
        </div>
      )}

      {isCancelOrder && (
        <CancelOrderModal
          order={order}
          setIsCancel={setIsCancelOrder}
          handleCancelOrder={handleCancelOrder}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
 