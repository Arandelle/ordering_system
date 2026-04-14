import { Product as ProductModel } from "@/models/Product";
import { isValidObjectId } from "mongoose";
import { notFound } from "next/navigation";
import ProductFormPage from "../../ProductPage";
import { connectDB } from "@/lib/mongodb";

const EditProductPage = async ( context : {params: Promise<{id: string}>}) => {
  
  await connectDB();
  const { id } = await context.params;

  if (!isValidObjectId(id)) return notFound();

  const product = await ProductModel.findById(id).lean();

  if (!product) return notFound();

  const serialized = JSON.parse(JSON.stringify(product));

  console.log(serialized)

  return <ProductFormPage editProduct={serialized} />;
};

export default EditProductPage;
