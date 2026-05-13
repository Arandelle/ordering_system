import { Types } from "mongoose";

export interface IItemReview {
  productId: Types.ObjectId;
  name: string;
  image?: string | null;
  rating?: number | null;
  comment?: string | null;
}
 
export interface IReview extends Document {
  orderId: Types.ObjectId;
  customerId?: Types.ObjectId | null;
  branchId: Types.ObjectId;
  rating: number;
  comment?: string | null;
  itemReviews: IItemReview[];
  isVisible: boolean;
  averageItemRating?: number | null;
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
  itemReviews?: ItemReviewInput[];
}

export interface SubmitReviewPayload {
  rating: number;           // 1-5, required
  comment?: string;         // optional overall comment
  itemReviews?: ItemReviewInput[];
}

export interface SubmitReviewResponse {
  message: string;
  reviewId: string;
}