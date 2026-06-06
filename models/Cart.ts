import mongoose, { models, Schema } from "mongoose";

export const CartItemSchema = new Schema(
  {
    _id: { type: String, required: true }, // preserves your MenuItem._id
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    category: {
      _id: { type: String },
      name: { type: String },
    },
    activeProductDiscount: {
      promotionId: { type: String },
      name: { type: String },
      discountType: { type: String, enum: ["percentage", "fixed"] },
      discountValue: { type: Number },
      originalPrice: { type: Number },
      discountedPrice: { type: Number },
      discountAmount: { type: Number },
      label: { type: String },
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }, // prevent Mongoose from overriding your string _id
);

const CartSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      unique: true,
      required: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  },
);

export const Cart = models.Cart || mongoose.model("Cart", CartSchema)
