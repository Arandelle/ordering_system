import { connectDB } from "@/lib/mongodb";
import "@/lib/registerModels";
import { ProductDiscountPromotion } from "@/models/ProductDiscountPromotion";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { ProductDiscountPromotionEditor } from "../../components/ProductDiscountPromotionEditor";
import { ProductDiscountPromotion as ProductDiscountPromotionType } from "../../types";

type EditProductDiscountPromotionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductDiscountPromotionPage({
  params,
}: EditProductDiscountPromotionPageProps) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) return notFound();

  await connectDB();

  const promotion = await ProductDiscountPromotion.findById(id).lean();

  if (!promotion) return notFound();

  const serialized = JSON.parse(
    JSON.stringify(promotion),
  ) as ProductDiscountPromotionType;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="mb-0 text-xl font-bold text-gray-800 md:mb-2 md:text-2xl lg:text-3xl">
          Edit Product Discount
        </h1>
        <p className="text-sm text-gray-500 lg:text-lg">
          Update target products, discount value, schedule, and redemption
          limit.
        </p>
      </div>
      <ProductDiscountPromotionEditor mode="edit" promotion={serialized} />
    </section>
  );
}
