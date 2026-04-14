import mongoose, { models, Schema } from "mongoose";

const SubCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    position: { type: Number, default: 1 },
  },
  { timestamps: true },
);

export const SubCategory =
  models.SubCategory || mongoose.model("SubCategory", SubCategorySchema);
