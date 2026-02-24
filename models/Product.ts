import mongoose, { Schema, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: String,
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category'},

    isPopular: { type: Boolean, default: false },
    isSignature: { type: Boolean, default: false },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }, 
);

export const Product =
  models.Product || mongoose.model("Product", ProductSchema);
