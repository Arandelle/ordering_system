import { Product as ProductModel } from "@/models/Product";
import { isValidObjectId } from "mongoose";
import { notFound } from "next/navigation";
import ProductFormPage from "../../ProductPage";
import { connectDB } from "@/lib/mongodb";

const EditProductPage = async ( context : {params: Promise<{id: string}>}) => {
  
  await connectDB();
  const { id } = await context.params;

  if (!isValidObjectId(id)) return notFound();

  const product = await ProductModel.findById(id).populate({
    path: "modifierGroups.items.product",
    select: "name price",
  });

  if (!product) return notFound();

  const serialized = JSON.parse(JSON.stringify(product));

  // Apply goLiveDate check: if the scheduled go-live time has passed,
  // treat the product as live and persist the change
  if (serialized.goLiveDate && new Date(serialized.goLiveDate) <= new Date()) {
    serialized.isComingSoon = false;
    // Persist so the DB stays in sync (fire-and-forget)
    ProductModel.updateOne(
      { _id: product._id, isComingSoon: true },
      { $set: { isComingSoon: false } },
    ).catch(() => {});
  }

  return <ProductFormPage editProduct={serialized} />;
};

export default EditProductPage;
