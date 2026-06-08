import { connectDB } from "@/lib/mongodb";
import "@/lib/registerModels";
import { OrderDiscountPromotion } from "@/models/OrderDiscountPromotion";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { OrderDiscountPromotionEditor } from "../../components/OrderDiscountPromotionEditor";
import { OrderDiscountPromotion as OrderDiscountPromotionType } from "../../types";

type EditOrderDiscountPromotionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditOrderDiscountPromotionPage({
  params,
}: EditOrderDiscountPromotionPageProps) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) return notFound();

  await connectDB();

  const promotion = await OrderDiscountPromotion.findById(id).lean();

  if (!promotion) return notFound();

  const serialized = JSON.parse(
    JSON.stringify(promotion),
  ) as OrderDiscountPromotionType;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="mb-0 text-xl font-bold text-gray-800 md:mb-2 md:text-2xl lg:text-3xl">
          Edit Order Discount
        </h1>
        <p className="text-sm text-gray-500 lg:text-lg">
          Update discount value, eligibility rules, schedule, and redemption
          limit
        </p>
      </div>
      <OrderDiscountPromotionEditor mode="edit" promotion={serialized} />
    </section>
  );
}
