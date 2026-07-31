"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/buttons";
import ConfirmationWithReasonModal from "@/components/ConfirmationWithReasonModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { formatDate } from "@/helper/formatter";
import { useAdminUpdateOrder } from "@/hooks/api/admin/useAdminOrders";
import {
  ADMIN_CANCEL_REASONS,
  canTransitionTo,
  EXPIRE_REASONS,
  FULFILLMENT_TYPE,
  getActionConfig,
  ORDER_STATUSES,
  OrderStatus,
  STATUS_TRANSITIONS,
} from "@/types/orderConstants";
import { OrderType } from "@/types/OrderTypes";
import { toast } from "sonner";

interface Props {
  order: OrderType;
  role: "admin" | "customer";
}

/** Terminal actions that require a reason modal */
const REASON_REQUIRED_STATUSES: OrderStatus[] = [
  ORDER_STATUSES.CANCELLED,
  ORDER_STATUSES.EXPIRED,
];

/** Irreversible forward transitions that need a quick confirmation */
const CONFIRM_REQUIRED_STATUSES: OrderStatus[] = [
  ORDER_STATUSES.DISPATCH,
  ORDER_STATUSES.READY_FOR_PICKUP,
  ORDER_STATUSES.COMPLETED,
];

export function OrderActionButton({ order, role }: Props) {
  const { mutate, isPending } = useAdminUpdateOrder();
  const [pendingAction, setPendingAction] = useState<OrderStatus | null>(null);
  const [confirmingAction, setConfirmingAction] =
    useState<OrderStatus | null>(null);
  const [actionLocked, setActionLocked] = useState(false);

  const {
    status,
    fulfillmentType = FULFILLMENT_TYPE.DELIVERY,
    paymentInfo,
    reservation,
  } = order;

  const paymentMethod = paymentInfo.paymentMethod;
  const paymentConfirmed = paymentInfo.paymentConfirmed === true;

  const nextStatuses = STATUS_TRANSITIONS[status];

  if (!nextStatuses?.length) return null;

  const formatStatusLabel = (s: OrderStatus) =>
    s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ");

  const executeAction = (
    nextStatus: OrderStatus,
    extra?: { reason: string; notes: string },
  ) => {
    if (actionLocked) return;
    setActionLocked(true);
    const label = formatStatusLabel(nextStatus);
    mutate(
      {
        id: order._id,
        data: { status: nextStatus, ...extra },
      },
      {
        onSuccess: () => {
          toast.success(
            `Order #${order.paymentInfo.referenceNumber ?? order._id} → ${label}`,
          );
        },
        onSettled: () => {
          setActionLocked(false);
          setConfirmingAction(null);
          setPendingAction(null);
        },
      },
    );
  };

  const handleClick = (nextStatus: OrderStatus) => {
    if (actionLocked) return;
    if (REASON_REQUIRED_STATUSES.includes(nextStatus)) {
      setPendingAction(nextStatus);
      return;
    }
    if (CONFIRM_REQUIRED_STATUSES.includes(nextStatus)) {
      setConfirmingAction(nextStatus);
      return;
    }
    executeAction(nextStatus);
  };

  const handleReasonConfirm = (data: { reason: string; notes: string }) => {
    if (!pendingAction) return;
    executeAction(pendingAction, data);
  };

  const isDineInReservation =
    fulfillmentType === FULFILLMENT_TYPE.DINE_IN && !!reservation?.scheduledAt;

  const allowedStatuses = nextStatuses.filter((nextStatus) => {
    if (!canTransitionTo(status, nextStatus, role)) return false;
    // Pickup and dine-in orders cannot be dispatched — they go to ready_for_pickup
    if (
      fulfillmentType === FULFILLMENT_TYPE.PICKUP ||
      fulfillmentType === FULFILLMENT_TYPE.DINE_IN
    ) {
      if (nextStatus === ORDER_STATUSES.DISPATCH) return false;
    }
    // Delivery orders cannot be marked ready_for_pickup — they go to dispatch
    if (
      nextStatus === ORDER_STATUSES.READY_FOR_PICKUP &&
      fulfillmentType === FULFILLMENT_TYPE.DELIVERY
    ) {
      return false;
    }
    // Dine-in reservations: pending → confirmed (accept), then confirmed → preparing (1hr guard)
    if (status === ORDER_STATUSES.PENDING) {
      if (isDineInReservation && nextStatus === ORDER_STATUSES.PREPARING)
        return false;
      if (!isDineInReservation && nextStatus === ORDER_STATUSES.CONFIRMED)
        return false;
    }
    // Expire button only appears for pending_payment orders placed 5+ days ago
    if (
      nextStatus === ORDER_STATUSES.EXPIRED &&
      status === ORDER_STATUSES.PENDING_PAYMENT
    ) {
      const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
      const orderAge = Date.now() - new Date(order.createdAt).getTime();
      if (orderAge < fiveDaysMs) return false;
    }
    return true;
  });

  // Determine reasons list based on the pending action
  const getReasonsForAction = (action: OrderStatus): readonly string[] => {
    if (action === ORDER_STATUSES.EXPIRED) return EXPIRE_REASONS;
    if (action === ORDER_STATUSES.CANCELLED) return ADMIN_CANCEL_REASONS;
    return [];
  };

  const isBusy = actionLocked || isPending;

  // Split actions into forward-flow and destructive for visual grouping
  const forwardActions = allowedStatuses.filter(
    (s) => !REASON_REQUIRED_STATUSES.includes(s),
  );
  const destructiveActions = allowedStatuses.filter((s) =>
    REASON_REQUIRED_STATUSES.includes(s),
  );

  const renderActionButton = (nextStatus: OrderStatus) => {
    const actionConfig = getActionConfig(status, nextStatus);
    if (!actionConfig) return null;
    if (actionConfig.roles && !actionConfig.roles.includes(role)) return null;
    if (
      actionConfig.paymentMethods &&
      !actionConfig.paymentMethods.includes(paymentMethod)
    )
      return null;

    // Maya orders must be paid (paymentConfirmed) before admin can accept
    const isMayaUnpaid =
      paymentMethod === "maya" &&
      !paymentConfirmed &&
      nextStatus === ORDER_STATUSES.PREPARING;
    if (isMayaUnpaid) return null;

    // Guard: confirmed dine-in reservations can only start preparing
    // within 1 hour of scheduled time.
    const isPreparingConfirmedReservation =
      status === ORDER_STATUSES.CONFIRMED &&
      nextStatus === ORDER_STATUSES.PREPARING &&
      fulfillmentType === FULFILLMENT_TYPE.DINE_IN;

    if (isPreparingConfirmedReservation) {
      if (!reservation?.scheduledAt) {
        return (
          <span
            key={nextStatus}
            className="text-xs text-red-400 italic"
            title="Reservation date is missing — contact support"
          >
            Invalid reservation
          </span>
        );
      }

      const scheduledTime = new Date(reservation.scheduledAt).getTime();
      const oneHourBefore = scheduledTime - 60 * 60 * 1000;
      const isTooEarly = Date.now() < oneHourBefore;

      if (isTooEarly) {
        const scheduled = new Date(reservation.scheduledAt);
        const earliest = new Date(oneHourBefore);
        return (
          <IconButton
            key={nextStatus}
            variant="underline"
            disabled={true}
            className="text-xs p-0"
            title={`Reservation: ${formatDate(scheduled)} — You can start preparing at ${formatDate(earliest)}`}
            text={actionConfig.label}
          />
        );
      }
    }

    return (
      <IconButton
        key={nextStatus}
        onClick={() => handleClick(nextStatus)}
        disabled={isBusy}
        isLoading={isBusy}
        text={isBusy ? "Updating..." : actionConfig.label}
        variant="underline"
        className={`text-xs p-1 ${actionConfig.variant}`}
        title={actionConfig.label}
      />
    );
  };

  return (
    <>
      <div className="flex flex-col gap-1 items-center">
        {/* Forward-flow actions */}
        {forwardActions.map(renderActionButton)}

        {/* Visual separator before destructive actions */}
        {forwardActions.length > 0 && destructiveActions.length > 0 && (
          <div className="w-10 border-t border-stone-200 my-0.5" />
        )}

        {/* Destructive actions (Cancel, Expire) */}
        {destructiveActions.map(renderActionButton)}
      </div>

      {confirmingAction && (
        <ConfirmModal
          title={formatStatusLabel(confirmingAction)}
          subTitle={`Order #${order.paymentInfo.referenceNumber ?? order._id}`}
          message={`Are you sure you want to ${formatStatusLabel(confirmingAction).toLowerCase()} this order? This action cannot be undone.`}
          confirmLabel={formatStatusLabel(confirmingAction)}
          isLoading={isBusy}
          onClose={() => setConfirmingAction(null)}
          onConfirm={() => executeAction(confirmingAction)}
        />
      )}

      {pendingAction && (
        <ConfirmationWithReasonModal
          title={
            pendingAction === ORDER_STATUSES.EXPIRED
              ? "Expire Order"
              : "Cancel Order"
          }
          subTitle="This action cannot be undone."
          referenceLabel={order.paymentInfo.referenceNumber ?? order._id}
          reasons={getReasonsForAction(pendingAction)}
          confirmLabel={
            pendingAction === ORDER_STATUSES.EXPIRED
              ? "Expire Order"
              : "Cancel Order"
          }
          isLoading={isBusy}
          onClose={() => setPendingAction(null)}
          onConfirm={handleReasonConfirm}
        />
      )}
    </>
  );
}
