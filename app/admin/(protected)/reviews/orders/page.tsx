"use client";

import React, { useState } from "react";
import Pagination from "@/components/ui/Pagination";
import { TextareaField } from "@/components/ui/FormComponents";
import Modal from "@/components/ui/Modal";
import {
  useAdminReviews,
  useAdminReviewReply,
  useToggleReviewVisibility,
} from "@/hooks/api/admin/useAdminReviews";
import { useAdminBranchContext } from "@/contexts/AdminBranchContext";
import { useBranchName } from "@/app/admin/hooks/useBranchName";
import PermissionGuard from "@/lib/PermissionGuard";
import { formatDate } from "@/helper/formatter/";
import { ReviewListItem } from "@/types/ReviewTypes";
import LoadingPage from "@/components/ui/LoadingPage";
import StarRatingDisplay from "@/components/ui/StarRating";
import ReviewStatsCard from "../components/ReviewStatsCard";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { OrderItemImage } from "@/app/customer/components/OrderItemImage";
import ReviewFilter from "../components/ReviewFilter";
import { useReviewFilters } from "../hooks/useReviewFilter";

/** Full review detail modal */
const ViewDetailsModal = ({
  review,
  onClose,
}: {
  review: ReviewListItem;
  onClose: () => void;
}) => {
  return (
    <Modal
      onClose={onClose}
      title="Review Details"
      subTitle={`Order review from ${review.isAnonymous ? "Anonymous" : review.customerName || "Guest"}`}
      contentClassName="!p-0"
    >
      <div className="divide-y divide-gray-100">
        {/* Rating & Comment Section */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <StarRatingDisplay rating={review.rating} size={18} />
            <div className="flex items-center gap-1 ml-auto">
              <span
                className={`text-xs font-medium ${review.isVisible ? "text-emerald-600" : "text-red-600"}`}
              >
                {review.isVisible ? "Visible" : "Hidden"}
              </span>
            </div>
          </div>

          {review.comment && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
              {review.comment}
            </div>
          )}
          {!review.comment && (
            <p className="text-sm text-gray-400 italic">No comment provided</p>
          )}
        </div>

        {/* Customer Info */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Customer Information
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <DynamicIcon name="User" size={14} className="text-gray-400" />
              <span className="text-sm text-gray-700">
                {review.isAnonymous
                  ? "Anonymous"
                  : review.customerName || "Guest"}
              </span>
            </div>
            {review.customerEmail && !review.isAnonymous && (
              <div className="flex items-center gap-2">
                <DynamicIcon
                  name="MessageCircle"
                  size={14}
                  className="text-gray-400"
                />
                <span className="text-sm text-gray-500">
                  {review.customerEmail}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <DynamicIcon name="MapPin" size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {review.branchName || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DynamicIcon
                name="Calendar"
                size={14}
                className="text-gray-400"
              />
              <span className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Item Reviews */}
        {review.itemReviews && review.itemReviews.length > 0 && (
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Item Ratings ({review.itemReviews.length} items)
            </p>
            <div className="space-y-3">
              {review.itemReviews.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:grid sm:grid-cols-[2fr_4fr_12fr] gap-2 sm:gap-3 bg-white rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex gap-3 sm:contents">
                    {/** Image */}
                    <div className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100">
                      <OrderItemImage
                        image={item.image ?? ""}
                        name={item.name}
                      />
                    </div>

                    {/** Name + Rating */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-medium text-gray-800">
                          {item.name}
                        </span>
                        {!item.productId && (
                          <span className="text-xs text-red-400 italic">
                            (Deleted)
                          </span>
                        )}
                      </div>
                      {item.rating ? (
                        <div className="flex items-center gap-1.5">
                          <StarRatingDisplay rating={item.rating} size={12} />
                          <span className="text-xs font-semibold text-gray-600">
                            {item.rating}/5
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No rating</p>
                      )}
                    </div>
                  </div>

                  {item.comment && (
                    <p className="text-xs text-gray-500 pl-15 sm:pl-0 sm:mt-1">
                      {item.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Admin Reply
          </p>
          {review.reply ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DynamicIcon
                  name="CornerDownRight"
                  size={14}
                  className="text-blue-500"
                />
                <span className="text-sm font-semibold text-blue-700">
                  {review.reply.staffName}
                </span>
                {review.reply.createdAt && (
                  <span className="text-xs text-blue-400">
                    · {formatDate(review.reply.createdAt.toString())}
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-600 leading-relaxed">
                {review.reply.comment}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No reply yet</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

/** Reply modal using project Modal component */
const ReplyModal = ({
  review,
  onClose,
}: {
  review: ReviewListItem;
  onClose: () => void;
}) => {
  const [comment, setComment] = useState(review.reply?.comment || "");
  const replyMutation = useAdminReviewReply();

  const handleSubmit = () => {
    if (!comment.trim()) return;
    replyMutation.mutate(
      { id: review._id, payload: { comment: comment.trim() } },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      onClose={onClose}
      title={review.reply ? "Update Reply" : "Reply to Review"}
      subTitle={`${review.rating}/5 — ${review.isAnonymous ? "Anonymous" : review.customerName || "Guest"}`}
      className="z-60!"
    >
      {/* Review summary */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <StarRatingDisplay rating={review.rating} size={16} />
          <span className="text-sm font-semibold text-gray-600">
            {review.rating}/5
          </span>
        </div>
        {review.comment && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
            {review.comment}
          </div>
        )}
        {review.itemReviews && review.itemReviews.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
            <p className="text-xs font-semibold text-gray-500">Item Ratings:</p>
            {review.itemReviews.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                {item.rating ? (
                  <>
                    <StarRatingDisplay rating={item.rating} size={12} />
                    <span className="text-xs font-semibold text-gray-600">
                      {item.rating}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">No rating</span>
                )}
                <span className="font-medium text-gray-700">{item.name}</span>
                {item.comment && (
                  <span className="text-gray-500 text-xs truncate">
                    — {item.comment}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400">
          By {review.isAnonymous ? "Anonymous" : review.customerName || "Guest"}{" "}
          · {formatDate(review.createdAt)}
        </p>
      </div>

      {review.reply && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm mb-4">
          <p className="font-semibold text-blue-700">
            Previous reply by {review.reply.staffName}
          </p>
          <p className="text-blue-600">{review.reply.comment}</p>
        </div>
      )}

      <TextareaField
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Write your reply..."
      />

      <p className="text-xs text-gray-400 text-right mt-1">
        {comment.length}/500
      </p>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!comment.trim() || replyMutation.isPending}
          className="px-4 py-2 text-sm font-medium bg-brand-color-500 text-white rounded-lg hover:bg-brand-color-600 disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          <DynamicIcon name="Send" size={14} />
          {replyMutation.isPending ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </Modal>
  );
};

/** Single review card component */
const ReviewCard = ({
  review,
  onReply,
  onViewDetails,
}: {
  review: ReviewListItem;
  onReply: () => void;
  onViewDetails: () => void;
}) => {
  const [showItems, setShowItems] = useState(false);
  const toggleVisibilityMutation = useToggleReviewVisibility();
  const hasItemReviews = review.itemReviews && review.itemReviews.length > 0;

  return (
    <div
      className={`flex flex-col bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${
        !review.isVisible
          ? "border-red-200 bg-red-50/20 opacity-70"
          : "border-gray-100"
      }`}
    >
      <div className="flex-1">
        {/* Card header: customer + rating + status */}
        <div className="px-5 pt-5 pb-3 flex items-start gap-4">
          {/* Customer avatar placeholder */}
          <div className="w-10 h-10 rounded-full bg-brand-color-50 flex items-center justify-center shrink-0 border border-brand-color-200">
            <DynamicIcon
              name="User"
              size={18}
              className="text-brand-color-500"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-800 truncate">
                {review.isAnonymous
                  ? "Anonymous"
                  : review.customerName || "Guest"}
              </span>
              {!review.isAnonymous && review.customerEmail && (
                <span className="text-xs text-gray-400 truncate hidden sm:inline">
                  {review.customerEmail}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <DynamicIcon name="MapPin" size={12} />{" "}
                {review.branchName || "—"}
              </span>
              <span className="flex items-center gap-1">
                <DynamicIcon name="Calendar" size={12} />{" "}
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
        {/* Stars row + comment */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <StarRatingDisplay rating={review.rating} size={16} />
            <span className="text-xs font-semibold text-gray-500">
              {review.rating}/5
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {review.comment}
            </p>
          )}
          {!review.comment && (
            <p className="text-sm text-gray-400 italic">No comment</p>
          )}
        </div>
        {/* Reply indicator */}
        {review.reply && (
          <div className="px-5 pb-3">
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
              <DynamicIcon
                name="CornerDownRight"
                size={14}
                className="text-gray-500 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-gray-700">
                  {review.reply.staffName}
                </span>
                <p className="text-xs text-gray-600 truncate">
                  {review.reply.comment}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Item reviews toggle */}
        {hasItemReviews && (
          <div className="px-5 pb-2">
            <button
              onClick={() => setShowItems(!showItems)}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-color-500 hover:text-brand-color-600 cursor-pointer"
            >
              <DynamicIcon name="Package" size={13} />
              {review.itemReviews.length} item rating(s)
              {showItems ? (
                <DynamicIcon name="ChevronUp" size={13} />
              ) : (
                <DynamicIcon name="ChevronDown" size={13} />
              )}
            </button>
            {showItems && (
              <div className="mt-2 space-y-2">
                {review.itemReviews.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-gray-50 rounded-lg p-2.5"
                  >
                    <div className="w-8 h-8 rounded object-cover shrink-0 border border-gray-100">
                      <OrderItemImage
                        image={item.image ?? ""}
                        name={item.name}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {item.name}
                        </span>
                        {!item.productId && (
                          <span className="text-xs text-red-400 italic">
                            (Deleted)
                          </span>
                        )}
                      </div>
                      {item.rating ? (
                        <div className="flex items-center gap-1">
                          <StarRatingDisplay rating={item.rating} size={12} />
                          <span className="text-xs text-gray-500">
                            {item.rating}/5
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No rating</p>
                      )}
                      {item.comment && (
                        <p className="text-xs text-gray-500 truncate">
                          {item.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions row */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
        <PermissionGuard permission="reviews.update">
          <button
            onClick={() => toggleVisibilityMutation.mutate(review._id)}
            disabled={toggleVisibilityMutation.isPending}
            data-tooltip-id="app-tooltip"
            data-tooltip-content={
              review.isVisible ? "Hide review" : "Show review"
            }
            data-tooltip-place="bottom"
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              review.isVisible
                ? "hover:bg-emerald-50 hover:text-emerald-600"
                : "hover:bg-red-50 hover:text-red-600"
            }`}
          >
            {review.isVisible ? (
              <DynamicIcon name="Eye" size={15} />
            ) : (
              <DynamicIcon name="EyeOff" size={15} />
            )}
          </button>

          <button
            onClick={onReply}
            data-tooltip-id="app-tooltip"
            data-tooltip-content={review.reply ? "Edit reply" : "Reply"}
            data-tooltip-place="bottom"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <DynamicIcon
              name={review.reply ? "CornerDownRight" : "MessageSquare"}
              size={15}
            />
          </button>
        </PermissionGuard>

        <button
          onClick={onViewDetails}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          <DynamicIcon name="FileText" size={13} /> View Details
        </button>
      </div>
    </div>
  );
};

const OrderReviewsPage = () => {
  const reviewFilters = useReviewFilters();

  const {
    jumpToPage,
    currentPage,
    appliedSearch,
    ratingFilter,
    visibilityFilter,
  } = reviewFilters;

  const { selectedBranchId } = useAdminBranchContext();
  const { branchName } = useBranchName();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- reset pagination on branch change (side-effect of external system)
  React.useEffect(() => {
    jumpToPage(1);
  }, [selectedBranchId]);

  const [limit, setLimit] = useState(10);
  const [replyingTo, setReplyingTo] = useState<ReviewListItem | null>(null);
  const [viewingReview, setViewingReview] = useState<ReviewListItem | null>(
    null,
  );

  const queryParams: Record<string, string | number | undefined> = {
    page: currentPage,
    limit,
    search: appliedSearch,
    rating: ratingFilter === "all" ? undefined : Number(ratingFilter),
    isVisible: visibilityFilter === "all" ? undefined : visibilityFilter,
    branchId: selectedBranchId === "all" ? undefined : selectedBranchId,
  };

  const { data, isPending } = useAdminReviews(queryParams);

  const reviews = data?.data ?? [];
  const pagination = data?.pagination;
  const stats = data?.stats;

  if (isPending) {
    return <LoadingPage />;
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Order Reviews —{" "}
          <span className="text-brand-color-500">{branchName}</span>
        </h1>
        <p className="text-gray-500">View and manage customer order reviews</p>
      </div>

      {/* Stats cards */}
      {stats && stats.totalReviews > 0 && (
        <ReviewStatsCard
          stats={{
            averageRating: stats.averageRating,
            totalCount: stats.totalReviews,
            ratingDistribution: stats.ratingDistribution,
            hasRatings: stats.totalReviews > 0,
          }}
          totalLabel="Total Reviews"
        />
      )}

      {/** Fields for filtering */}
      <ReviewFilter filters={reviewFilters} />

      {/* Review cards list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Customer Reviews</h3>
          <p className="text-sm text-gray-500 mt-1">
            Order-level ratings and feedback
          </p>
        </div>

        <div className="p-4 space-y-4">
          {reviews.length > 0 ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onReply={() => setReplyingTo(review)}
                  onViewDetails={() => setViewingReview(review)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center gap-3">
              <DynamicIcon name="Package" size={40} className="text-gray-300" />
              <p className="text-sm text-gray-500">
                No reviews found for this branch.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onPageChange={jumpToPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            jumpToPage(1);
          }}
        />
      )}

      {/* Reply modal */}
      {replyingTo && (
        <ReplyModal review={replyingTo} onClose={() => setReplyingTo(null)} />
      )}

      {/* View details modal */}
      {viewingReview && (
        <ViewDetailsModal
          review={viewingReview}
          onClose={() => setViewingReview(null)}
        />
      )}
    </section>
  );
};

export default OrderReviewsPage;
