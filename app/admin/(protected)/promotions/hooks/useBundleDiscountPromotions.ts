import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import { BundleDiscountPromotionsResponse } from "../(pages)/bundle-discounts/type";

export const useBundleDiscountPromotions = () => {
  return useQuery({
    queryKey: ["admin", "bundle-discount-promotions"],
    queryFn: () =>
      apiClient.get<BundleDiscountPromotionsResponse>(
        "/admin/bundle-discount-promotions",
      ),
  });
};
