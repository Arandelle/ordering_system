"use client";

import { apiClient } from "@/lib/apiClient";
import type { ActivePromotionsResponse } from "@/types/promotions.type";
import { useQuery } from "@tanstack/react-query";

export const ACTIVE_PROMOTIONS_QUERY_KEY = ["promotions", "active"] as const;

export function useActivePromotions() {
  return useQuery({
    queryKey: ACTIVE_PROMOTIONS_QUERY_KEY,
    queryFn: () =>
      apiClient.get<ActivePromotionsResponse>("/promotions/active"),
    staleTime: 60_000,
  });
}
