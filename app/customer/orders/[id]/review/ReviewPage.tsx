"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useCustomerOrder } from "@/hooks/api/customers/useCustomerOrders";
import { useSubmitReview } from "@/hooks/api/customers/useSubmitReview";
import {
  useGetOrderReview,
  orderReviewKeys,
} from "@/hooks/api/customers/useGetOrderReview";
import { useEditReview } from "@/hooks/api/customers/useProductReviews";
import { useQueryClient } from "@tanstack/react-query";
import {
  ItemReviewInput,
  ItemReviewEditInput,
  EditReviewPayload,
  OrderReviewResponse,
} from "@/types/ReviewTypes";
import { TextareaField } from "@/components/ui/FormComponents";
import { OrderItemImage } from "@/app/customer/components/OrderItemImage";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { OrderType } from "@/types/OrderTypes";
import { ORDER_STATUSES } from "@/types/orderConstants";
import LoadingPage from "@/components/ui/LoadingPage";

// ─── Star Row ─────────────────────────────────────────────────────────────────
const LABELS = [
  "No rating",
  "Poor 😓",
  "Fair 😐",
  "Good 🙂",
  "Very Good 😋",
  "Excellent 😍",
];

const StarRow = ({
  value,
  onChange,
  size = "md",
  labels,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md" | "lg";
  labels?: string[];
}) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  const dim =
    size === "lg" ? "w-12 h-12" : size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const labelSize =
    size === "lg"
      ? "text-lg font-semibold"
      : size === "sm"
        ? "text-sm font-medium"
        : "text-base font-semibold";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center-safe gap-1 group">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`transition-transform focus:outline-none active:scale-150 cursor-pointer ${
              star <= display ? "group-hover:scale-110" : ""
            }`}
          >
            <DynamicIcon
              name="Star"
              className={`${dim} transition-all duration-150`}
              fill={star <= display ? "#ef4501" : "#e5e7eb"}
              stroke={star <= display ? "#c13500" : "#d1d5db"}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      {labels && display > 0 && (
        <span
          className={`${labelSize} text-brand-color-500 ml-2 transition-opacity duration-150 ${
            hovered ? "opacity-100" : "opacity-80"
          }`}
        >
          {labels[display]}
        </span>
      )}
    </div>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_TO_SHOW = 3;

// ─── Review Form Inner ────────────────────────────────────────────────────────
// Uses lazy useState initialization from existingReview so we avoid
// calling setState inside effects (which triggers cascading renders).

function ReviewFormInner({
  order,
  existingReview,
  isEditMode,
  submitReview,
  editReview,
  isProcessing,
  queryClient,
  router,
}: {
  order: OrderType;
  existingReview: OrderReviewResponse | undefined;
  isEditMode: boolean;
  submitReview: (payload: any) => Promise<any>;
  editReview: (args: any) => Promise<any>;
  isProcessing: boolean;
  queryClient: any;
  router: ReturnType<typeof useRouter>;
}) {
  // Lazy state initialization from existing review data
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [isAnonymous, setIsAnonymous] = useState(
    existingReview?.isAnonymous ?? false,
  );

  const [itemRatings, setItemRatings] = useState<
    Record<string, { rating: number | null; comment: string }>
  >(() => {
    const initial: Record<string, { rating: number | null; comment: string }> =
      {};
    // Pre-fill from existing review item entries
    if (existingReview) {
      existingReview.itemReviews.forEach((ir) => {
        if (ir.productId) {
          initial[ir.productId] = {
            rating: ir.rating ?? null,
            comment: ir.comment ?? "",
          };
        }
      });
    }
    // Ensure every order item has an entry (some items may not have been individually rated)
    order.items.forEach((item) => {
      if (!initial[item.productId]) {
        initial[item.productId] = { rating: null, comment: "" };
      }
    });
    return initial;
  });

  const [showAllItems, setShowAllItems] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const setItemRating = (productId: string, value: number) => {
    setItemRatings((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], rating: value },
    }));
  };

  const setItemComment = (productId: string, value: string) => {
    setItemRatings((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], comment: value },
    }));
  };

  // mergedItemRatings ensures all order items have entries even if not previously rated
  const mergedItemRatings = useMemo(() => {
    const merged = { ...itemRatings };
    order.items.forEach((item) => {
      if (!merged[item.productId]) {
        merged[item.productId] = { rating: null, comment: "" };
      }
    });
    return merged;
  }, [itemRatings, order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }

    if (isEditMode && existingReview) {
      // ── Edit: PATCH existing review ────────────────────────────────────
      const itemReviews: ItemReviewEditInput[] = order.items
        .map((item) => {
          const ir = mergedItemRatings[item.productId];
          return {
            productId: item.productId,
            rating: ir?.rating ?? null,
            comment: ir?.comment?.trim() || null,
          };
        })
        .filter((ir) => ir.rating !== null || ir.comment !== null);

      const payload: EditReviewPayload = {
        rating,
        comment: comment.trim() || null,
        isAnonymous,
        itemReviews,
      };

      try {
        await editReview({
          reviewId: existingReview._id,
          payload,
        });
        // Invalidate review + order queries so UI reflects the update
        queryClient.invalidateQueries({
          queryKey: orderReviewKeys.detail(order._id),
        });
        queryClient.invalidateQueries({
          queryKey: ["orders", "customer", order._id],
        });
        queryClient.invalidateQueries({
          queryKey: ["orders", "customer"],
        });
        toast.success("Review updated successfully!");
        router.push("/orders?status=completed");
      } catch (error: unknown) {
        const msg =
          error instanceof Error
            ? error.message
            : "Failed to update review. Please try again.";
        toast.error(msg);
      }
    } else {
      // ── New: POST review ───────────────────────────────────────────────
      const itemReviews: ItemReviewInput[] = order.items
        .map((item) => {
          const ir = mergedItemRatings[item.productId];
          return {
            productId: item.productId,
            name: item.name,
            image: item.image ?? null,
            rating: ir?.rating ?? null,
            comment: ir?.comment?.trim() || null,
          };
        })
        .filter((ir) => ir.rating !== null || ir.comment);

      try {
        await submitReview({
          rating,
          comment: comment.trim() || undefined,
          isAnonymous,
          itemReviews,
        });
        toast.success("Thank you for your review!");
        router.push("/orders?status=completed");
      } catch (error: unknown) {
        const msg =
          error instanceof Error
            ? error.message
            : "Failed to submit review. Please try again.";
        toast.error(msg);
      }
    }
  };

  const displayedItems = showAllItems
    ? order.items
    : order.items.slice(0, ITEMS_TO_SHOW);

  return (
    <div className="bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* ── Header ── */}
          <div className="mb-8">
            <h1 className="text-brand-color-500 text-2xl md:text-3xl font-bold mb-2">
              {isEditMode ? "Edit Your Review" : "Rate Your Experience"}
            </h1>
            <p className="text-slate-600 font-semibold">
              Order #{order.paymentInfo.referenceNumber}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Completed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
            {isEditMode && existingReview && (
              <p className="text-xs text-gray-400 mt-1">
                Originally reviewed on{" "}
                {new Date(existingReview.createdAt).toLocaleDateString()}
                {existingReview.updatedAt &&
                  existingReview.updatedAt !== existingReview.createdAt &&
                  ` · Last edited ${new Date(existingReview.updatedAt).toLocaleDateString()}`}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ── Overall Rating ── */}
            <div className="space-y-4">
              <label className="font-[550] text-gray-700">
                Overall Experience <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center py-4">
                <StarRow
                  value={rating}
                  onChange={setRating}
                  size="lg"
                  labels={LABELS}
                />
              </div>
              <TextareaField
                label="Overall Comment (Optional)"
                subLabel={`Tell us about your experience`}
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you love? What could be better?"
                rows={3}
              />

              {/* Anonymous toggle */}
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-color-500 focus:ring-brand-color-500 accent-brand-color-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">
                  Post anonymously
                </span>
                <span className="text-xs text-gray-400">
                  — Your name will be hidden from other customers
                </span>
              </label>
            </div>

            {/* ── Per-Item Ratings ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-[550] text-gray-700">
                  Rate Individual Items{" "}
                  <span className="text-gray-400 font-normal text-sm">
                    (Optional)
                  </span>
                </h3>
              </div>

              <div className="space-y-4">
                {displayedItems.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="p-4 bg-gray-50 rounded-xl space-y-3"
                  >
                    {/* Item header */}
                    <div className="flex gap-3 items-center">
                      <div className="w-14 h-14 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image ? (
                          <div className="w-full h-full object-cover">
                            <OrderItemImage
                              image={item.image}
                              name={item.name}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <DynamicIcon
                              name="Package"
                              size={20}
                              className="text-gray-400"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          qty: {item.quantity}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <StarRow
                          value={mergedItemRatings[item.productId]?.rating ?? 0}
                          onChange={(v) => setItemRating(item.productId, v)}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Item comment — only show if item has been rated */}
                    {(mergedItemRatings[item.productId]?.rating ?? 0) > 0 && (
                      <TextareaField
                        label="Leave a comment"
                        subLabel={`Did ${item.name} satisfy your cravings?`}
                        placeholder={`Share your thoughts about ${item.name} (optional)`}
                        value={mergedItemRatings[item.productId]?.comment ?? ""}
                        onChange={(e) =>
                          setItemComment(item.productId, e.target.value)
                        }
                        rows={2}
                      />
                    )}
                  </div>
                ))}

                {order.items.length > ITEMS_TO_SHOW && (
                  <button
                    type="button"
                    onClick={() => setShowAllItems(!showAllItems)}
                    className="w-full py-2 text-sm text-brand-color-500 hover:text-[#c13500] font-semibold transition-colors cursor-pointer"
                  >
                    {showAllItems
                      ? "Show Less"
                      : `+${order.items.length - ITEMS_TO_SHOW} More Items`}
                  </button>
                )}
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isProcessing || rating === 0}
                className="flex-1 bg-brand-color-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#c13500] transition-colors disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? isEditMode
                    ? "Updating..."
                    : "Submitting..."
                  : isEditMode
                    ? "Update Review"
                    : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                {isEditMode ? "Cancel" : "Skip for Now"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Your feedback helps us improve our service
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ReviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = String(params.id ?? "");
  const queryClient = useQueryClient();

  const { data: order, isPending: isLoading } = useCustomerOrder(orderId);
  const { mutateAsync: submitReview, isPending: isSubmitting } =
    useSubmitReview(orderId);
  const { mutateAsync: editReview, isPending: isEditing } = useEditReview();

  // Whether this is an edit (order already reviewed) vs. a new submission
  const isEditMode = useMemo(() => !!order?.isReviewed, [order]);

  // Fetch existing review when in edit mode
  const { data: existingReview, isPending: isReviewLoading } =
    useGetOrderReview(orderId, isEditMode);

  // Guard: redirect if order not completed
  useEffect(() => {
    if (order && order.status !== ORDER_STATUSES.COMPLETED) {
      toast.warning("You can only review completed orders");
      router.push("/orders");
    }
  }, [order, router]);

  const isProcessing = isSubmitting || isEditing;

  if (isLoading || (isEditMode && isReviewLoading)) {
    return <LoadingPage text="Loading order review..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center gap-4 bg-white border border-gray-200 rounded-2xl shadow-sm px-10 py-12 max-w-sm w-full text-center">
          <div className="flex items-center justify-center size-16 rounded-full bg-red-50">
            <DynamicIcon
              name="HandPlatter"
              size={32}
              className="text-red-500"
              strokeWidth={1.75}
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-gray-900 font-semibold text-base">
              Order not found
            </h2>
            <p className="text-gray-500 text-sm">
              We couldn't find the order you're looking for. It may have been
              removed or the link is incorrect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // key forces ReviewFormInner to remount when existingReview arrives,
  // so lazy useState initialization picks up the new data
  return (
    <ReviewFormInner
      key={existingReview?._id ?? "new"}
      order={order}
      existingReview={existingReview}
      isEditMode={isEditMode}
      submitReview={submitReview}
      editReview={editReview}
      isProcessing={isProcessing}
      queryClient={queryClient}
      router={router}
    />
  );
};

export default ReviewPage;
