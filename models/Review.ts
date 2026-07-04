import mongoose from "mongoose";
import { models, Schema } from "mongoose";

// ─── Item-level review (optional per item in the order) ───────────────────────
const ItemReviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null, // null if product was deleted after review
    },
    name: {
      type: String,
      required: true, // snapshot at review time
    },
    image: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null, // null = customer skipped this item
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  { _id: false },
);

// ─── Admin reply to a review ────────────────────────────────────────────────
const ReplySchema = new Schema(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    staffName: {
      type: String,
      required: true, // snapshot at reply time
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      required: true,
    },
  },
  { timestamps: true, _id: false },
);

// ─── Helpful vote (like/dislike) ──────────────────────────────────────────────
const HelpfulVoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isHelpful: {
      type: Boolean,
      required: true, // true = like, false = dislike
    },
  },
  { _id: false },
);

// ─── Review Schema ─────────────────────────────────────────────────────────────
const ReviewSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // one review per order, enforced at DB level
      index: true,
    },

    // Optional — null for guest orders
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    // ── Order-level (required) ──────────────────────────────────────────────
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    // ── Item-level (optional array, customer can skip any/all items) ────────
    itemReviews: {
      type: [ItemReviewSchema],
      default: [],
    },

    // ── Anonymous posting ───────────────────────────────────────────────────
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // ── Admin reply ─────────────────────────────────────────────────────────
    reply: {
      type: ReplySchema,
      default: null,
    },

    // ── Helpful votes (like/dislike by authenticated customers) ──────────────
    helpfulVotes: {
      type: [HelpfulVoteSchema],
      default: [],
    },

    // ── Moderation ──────────────────────────────────────────────────────────
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

// ─── Virtuals ──────────────────────────────────────────────────────────────────

// Average across all rated items (excludes skipped/null items)
ReviewSchema.virtual("averageItemRating").get(function () {
  const rated = this.itemReviews.filter((i) => i.rating != null);
  if (rated.length === 0) return null;
  return rated.reduce((sum, i) => sum + (i.rating ?? 0), 0) / rated.length;
});

// Total helpful (like) count
ReviewSchema.virtual("helpfulCount").get(function () {
  return this.helpfulVotes.filter((v) => v.isHelpful === true).length;
});

// Total not helpful (dislike) count
ReviewSchema.virtual("notHelpfulCount").get(function () {
  return this.helpfulVotes.filter((v) => v.isHelpful === false).length;
});

// Ensure virtuals are included when converting to JSON/Object
ReviewSchema.set("toObject", { virtuals: true });
ReviewSchema.set("toJSON", { virtuals: true });

export const Review = models.Review || mongoose.model("Review", ReviewSchema);


