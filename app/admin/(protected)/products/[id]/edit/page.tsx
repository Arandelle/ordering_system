import { Product as ProductModel } from "@/models/Product";
import { isValidObjectId } from "mongoose";
import { notFound } from "next/navigation";
import ProductFormPage from "../../ProductPage";

const EditProductPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  if (!isValidObjectId(id)) return notFound();

  const product = await ProductModel.findById(id).lean();

  if (!product) return notFound();

  const serialized = JSON.parse(JSON.stringify(product));

  return <ProductFormPage editProduct={serialized} />;
};

export default EditProductPage;
