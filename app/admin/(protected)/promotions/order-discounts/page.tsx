"use client";

import SectionHeader from "@/app/admin/components/SectionHeader";
import LoadingPage from "@/components/ui/LoadingPage";
import { useRouter } from "next/navigation";
import { useOrderDiscountPromotions } from "../hooks/useOrderDiscountPromotions";
import { PromotionList } from "./components/PromotionList";

export default function OrderDiscountPromotionsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useOrderDiscountPromotions();
  const promotions = data?.data ?? [];

  if (isLoading) return <LoadingPage />;

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Order Discounts"
        subTitle="Create and manage whole-order discounts with schedule, minimum order, caps, and redemption limits"
        onClick={() => router.push("/promotions/order-discounts/new")}
        btnTxt="+ Create Discount"
        permission=""
      />
      {error ? (
        <p className="text-sm font-medium text-red-600">
          Failed to load order discount promotions.
        </p>
      ) : (
        <PromotionList promotions={promotions} />
      )}
    </section>
  );
}
