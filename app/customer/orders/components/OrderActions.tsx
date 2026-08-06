import { OrderType } from "@/types/OrderTypes";
import { useRouter } from "next/navigation";
import { useOrderState } from "../hooks/useOrderState";
import { useOrderActions } from "@/hooks/useOrderActions";
import CancelOrderModal from "./CancelOrderModal";
import { useState } from "react";
import { IconButton } from "@/components/ui/buttons";

// ─── Main component ───────────────────────────────────────────────────────────

export function OrderActions({ order }: { order: OrderType | null }) {
  const { handlePayOrder, handleCancelOrder, handleBuyAgain, isLoading } =
    useOrderActions();

  const router = useRouter();
  const actions = useOrderState(order);
  const [isCancelOrder, setIsCancelOrder] = useState(false);

  if (!order || !actions) return null;

  const { needPayment, canCancel, canBuyAgain, needsReview, hasReview } =
    actions;
  const reviewPath = `/orders/${order._id}/review`;

  // ── Payment ────────────────────────────────────────────────────────────
  const payAction = needPayment && (
    <IconButton
      onClick={() => handlePayOrder(order._id)}
      isLoading={isLoading}
      loadingText="Waiting for payment..."
      variant="primary"
      icon={{ name: "CreditCard", size: 13 }}
      text="Pay now"
      className="rounded-lg px-3"
    />
  );

  // ── Review ─────────────────────────────────────────────────────────────
  const reviewAction = needsReview && (
    <IconButton
      onClick={() => router.push(reviewPath)}
      isLoading={isLoading}
      icon={{ name: "Star", size: 13 }}
      text="Leave review"
      className="rounded-lg px-3"
    />
  );

  // ── View / Edit Review ─────────────────────────────────────────────────
  const viewEditReviewAction = hasReview && (
    <IconButton
      onClick={() => router.push(reviewPath)}
      isLoading={isLoading}
      variant="outline"
      icon={{ name: "PenLine", size: 13 }}
      text="View/Edit review"
      className="rounded-lg px-3"
    />
  );

  // ── Buy Again ──────────────────────────────────────────────────────────
  const buyAgainAction = canBuyAgain && (
    <IconButton
      onClick={() => handleBuyAgain(order.items)}
      isLoading={isLoading}
      variant="secondary"
      icon={{ name: "ShoppingCart", size: 13 }}
      text="Buy again"
      className="rounded-lg px-3"
    />
  );

  // ── Cancel ─────────────────────────────────────────────────────────────
  const cancelAction = canCancel && (
    <IconButton
      onClick={() => setIsCancelOrder(true)}
      isLoading={isLoading}
      variant="danger"
      icon={{ name: "X", size: 13 }}
      text="Cancel order"
      className="rounded-lg px-3"
    />
  );

  // ── Render ─────────────────────────────────────────────────────────────
  if (!needPayment && !needsReview && !hasReview && !canBuyAgain && !canCancel)
    return null;

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        {payAction}
        {reviewAction}
        {viewEditReviewAction}
        {buyAgainAction}
        {cancelAction}
      </div>
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
}
