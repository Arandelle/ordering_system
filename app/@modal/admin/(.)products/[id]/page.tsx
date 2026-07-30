"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import ProductViewModal from "@/app/admin/components/ProductViewModal";

/**
 * Intercepting route: catches client-side navigation to /admin/products/[id]
 * and renders the product detail view inside a modal overlay.
 */
export default function ProductModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <Modal onClose={() => router.back()} title="Product Details">
      <ProductViewModal productId={id} />
    </Modal>
  );
}
