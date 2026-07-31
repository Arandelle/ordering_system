import ProductViewModal from "@/app/admin/components/ProductViewModal";

/**
 * Fallback page for direct URL access to /admin/products/view/[id].
 * When navigating from within the admin, the @modal intercepting route
 * shows this as a modal overlay instead.
 */
export default async function ProductViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ProductViewModal productId={id} />
    </div>
  );
}
