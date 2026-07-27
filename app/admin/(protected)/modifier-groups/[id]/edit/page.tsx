import "@/lib/registerModels";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { ModifierGroupTemplate } from "@/models/ModifierGroupTemplate";
import { Product } from "@/models/Product";
import EditModifierGroupTemplateClient from "./EditModifierGroupTemplateClient";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditModifierGroupTemplatePage({
  params,
}: EditPageProps) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) return notFound();

  await connectDB();

  const template = await ModifierGroupTemplate.findById(id).lean();
  if (!template) return notFound();

  // Count products referencing this template
  const productCount = await Product.countDocuments({
    "modifierGroups.templateId": new mongoose.Types.ObjectId(id),
  });

  // Populate item product references for display
  const productIds = template.items.map(
    (item: { product: mongoose.Types.ObjectId }) => item.product,
  );
  const products = await Product.find({ _id: { $in: productIds } })
    .select("name price image productType")
    .lean();

  const productMap = new Map(
    products.map((p) => [
      p._id.toString(),
      JSON.parse(JSON.stringify(p)),
    ]),
  );

  const populatedItems = template.items.map(
    (item: { product: mongoose.Types.ObjectId; [key: string]: unknown }) => ({
      ...item,
      product: productMap.get(item.product.toString()) ?? item.product,
    }),
  );

  const serialized = {
    ...JSON.parse(JSON.stringify(template)),
    items: populatedItems,
    productCount,
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="mb-0 text-xl font-bold text-gray-800 md:mb-2 md:text-2xl lg:text-3xl">
          Edit Modifier Template
        </h1>
        <p className="text-sm text-gray-500 lg:text-lg">
          Update a reusable modifier group applied to combo/set products
        </p>
      </div>
      <EditModifierGroupTemplateClient template={serialized} />
    </section>
  );
}
