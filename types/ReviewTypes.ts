import { Types } from "mongoose";

export interface IItemReview {
  productId: Types.ObjectId | null;
  name: string;
  image?: string | null;
  rating?: number | null;
  comment?: string | null;
}

export interface IReply {
  staffId: string;
  staffName: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHelpfulVote {
  userId: string;
  isHelpful: boolean;
}

export interface IReview extends Document {
  orderId: Types.ObjectId;
  customerId?: Types.ObjectId | null;
  branchId: Types.ObjectId;
  rating: number;
  comment?: string | null;
  itemReviews: IItemReview[];
  isAnonymous: boolean;
  reply?: IReply | null;
  helpfulVotes: IHelpfulVote[];
  isVisible: boolean;
  averageItemRating?: number | null;
  helpfulCount?: number;
  notHelpfulCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemReviewInput {
  productId: string;
  name: string;
  image?: string | null;
  rating?: number | null;
  comment?: string | null;
}

export interface ReviewBody {
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
  itemReviews?: ItemReviewInput[];
}

export interface SubmitReviewPayload {
  rating: number;           // 1-5, required
  comment?: string;         // optional overall comment
  isAnonymous?: boolean;    // post anonymously regardless of auth status
  itemReviews?: ItemReviewInput[];
}

export interface SubmitReviewResponse {
  message: string;
  reviewId: string;
}

// ── API response types ──────────────────────────────────────────────────────

export interface ReviewListItem {
  _id: string;
  orderId: string;
  customerId: string | null;
  customerName: string | null; // resolved from User, null for guest/anonymous
  customerEmail: string | null;
  branchId: string;
  branchName: string | null;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  itemReviews: ItemReviewListItem[];
  reply: IReply | null;
  helpfulVotes: IHelpfulVote[];
  helpfulCount: number;
  notHelpfulCount: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemReviewListItem {
  productId: string | null;
  name: string;
  image: string | null;
  rating: number | null;
  comment: string | null;
}

export interface ReviewListResponse {
  data: ReviewListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>; // 1-5 star counts
  };
}

export interface ProductReviewResponse {
  data: ReviewListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  averageRating: number;
  totalReviews: number;
}

// ── Admin reply payload ─────────────────────────────────────────────────────

export interface AdminReplyPayload {
  comment: string;
}

export interface AdminReplyResponse {
  message: string;
}

// ── Toggle visibility payload ───────────────────────────────────────────────

export interface ToggleVisibilityResponse {
  message: string;
  isVisible: boolean;
}

// ── Helpful vote payload ────────────────────────────────────────────────────

export interface HelpfulVotePayload {
  isHelpful: boolean;
}

export interface HelpfulVoteResponse {
  message: string;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote: boolean | null; // null = removed vote
}

// ── Edit review payload ─────────────────────────────────────────────────────

/** For editing — productId is required to identify which item to merge into; all other fields optional */
export interface ItemReviewEditInput {
  productId: string; // required: identifies which itemReview to update
  rating?: number | null;
  comment?: string | null;
}

export interface EditReviewPayload {
  rating?: number; // order-level rating (optional)
  comment?: string | null; // order-level comment (optional)
  isAnonymous?: boolean;
  itemReviews?: ItemReviewEditInput[]; // item-level edits, merged by productId
}

export interface EditReviewResponse {
  message: string;
  reviewId: string;
}
