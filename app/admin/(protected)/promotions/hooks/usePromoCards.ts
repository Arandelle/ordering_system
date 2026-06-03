import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import type { PromoCardResponse } from "../types/promo-card.type";

export const PROMO_CARDS_QUERY_KEY = ["admin", "promo-cards"] as const;

export function usePromoCards() {
  return useQuery({
    queryKey: PROMO_CARDS_QUERY_KEY,
    queryFn: () => apiClient.get<PromoCardResponse>("/admin/promo-cards"),
  });
}
